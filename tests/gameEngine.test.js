import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createInitialGameState } from '../src/state/initialGameState.js';
import { gameReducer } from '../src/state/gameReducer.js';
import { GAME_ACTIONS } from '../src/state/gameActions.js';
import { createStageHandlers } from '../src/state/stageHandlers.js';
import { ARCHETYPES } from '../src/data/surveyDB.js';
import { FATIGUE_ROLL_TABLE } from '../src/data/conditionDB.js';
import { executeD20Check, getSuccessProbability } from '../src/utils/diceEngine.js';
import { PUBLIC_ASSET_FILES } from '../src/data/assetDB.js';
import { ITEM_DATABASE as I, ITEM_DB } from '../src/data/itemDB.js';
import { EXPLORATION_STAGES } from '../src/data/explorationDB.js';
import { getEscapeEnding } from '../src/data/endingDB.js';
import { advanceStoryModal } from '../src/utils/storyFlow.js';
import { applyDamage, grantItems } from '../src/state/gameRules.js';
import { parseEndingCollection } from '../src/utils/endingCollection.js';

function harness(stage = 'SURVEY') {
  let state = { ...createInitialGameState(), stage };
  let succeed = true;
  let roll = 14;
  const checks = [];
  const update = (field, value) => { state = gameReducer(state, { type: GAME_ACTIONS.UPDATE_FIELD, field, value }); };
  const context = {
    getState: () => state, sfx: new Proxy({}, { get: () => () => {} }), addLog: () => {}, triggerGlitch: () => {},
    dispatch: (action) => { state = gameReducer(state, action); },
    openDiceCheck: (title, stat, dc, success, failure) => { checks.push({ title, stat, dc }); (succeed ? success : failure)(); },
    openConditionDice: (resolve) => resolve(roll),
  };
  for (const field of Object.keys(state)) context[`set${field[0].toUpperCase()}${field.slice(1)}`] = (value) => update(field, value);
  return {
    get state() { return state; }, checks, update,
    outcome(value) { succeed = value; }, condition(value) { roll = value; },
    handlers: () => createStageHandlers({ ...state, ...context }),
    close() { if (state.activeModalText) advanceStoryModal(state.activeModalText, (value) => update('activeModalText', value)); },
    drain() { let count = 0; while (state.activeModalText) { assert.ok(count++ < 20); this.close(); } },
    items(...items) { update('player', (player) => ({ ...player, inventory: items })); update('pendingRewards', []); },
  };
}

test('reducer preserves immutable updates and resets all final phases', () => {
  const initial = createInitialGameState();
  const changed = gameReducer(initial, { type: GAME_ACTIONS.UPDATE_FIELD, field: 'ap', value: (ap) => ap - 1 });
  assert.equal(initial.ap, 3); assert.equal(changed.ap, 2);
  const reset = gameReducer(changed, { type: GAME_ACTIONS.RESET });
  assert.equal(reset.ventPhase, 1); assert.equal(reset.player.maxSan, 15); assert.notEqual(reset.player, initial.player);
});

test('all 20 D20 outcomes match probability including natural 1 and 20', () => {
  for (const stat of [9, 10, 14, 15]) for (const dc of [1, 11, 14, 30]) {
    const results = Array.from({ length: 20 }, (_, i) => executeD20Check(stat, dc, 2, () => i / 20));
    assert.equal(results[0].isSuccess, false); assert.equal(results[19].isSuccess, true);
    assert.equal(results.filter((result) => result.isSuccess).length * 5, getSuccessProbability(stat, dc, 2));
  }
});

test('condition boundaries respect SAN 15 and correct HP maxima; female profile survives selection', () => {
  assert.deepEqual([1, 2, 7, 8, 14, 15, 19, 20].map((roll) => FATIGUE_ROLL_TABLE(roll).san), [12, 14, 14, 15, 15, 15, 15, 15]);
  assert.equal(ARCHETYPES[4].stats.LUK, 15);
  for (const roll of [1, 15, 20]) {
    const game = harness(); game.condition(roll);
    game.handlers().handleSelectArchetype(ARCHETYPES[4], 'F');
    game.handlers().handleRollCondition();
    assert.equal(game.state.player.gender, 'F'); assert.equal(game.state.player.profileId, 'GAMBLER');
    assert.equal(game.state.player.hp, game.state.player.maxHp); assert.equal(game.state.player.maxSan, 15);
    game.drain(); assert.equal(game.state.stage, 'STAGE_1_CAR6');
  }
});

test('all linked portraits/scenes/six cards and 29 item entries resolve to existing WebP files', () => {
  assert.equal(Object.keys(PUBLIC_ASSET_FILES).length, 29); assert.equal(Object.keys(I).length, 29);
  for (const path of Object.keys(PUBLIC_ASSET_FILES)) {
    assert.match(path, /\.webp$/); assert.ok(existsSync(fileURLToPath(new URL(`../${path}`, import.meta.url))), path);
  }
  for (const item of Object.values(I)) {
    assert.match(item.img, /\.webp$/); assert.ok(existsSync(fileURLToPath(new URL(`../public${item.img}`, import.meta.url))), item.img);
  }
  assert.match(ITEM_DB.lucky_coin.img, /item_gear_coin\.webp$/);
  assert.ok(existsSync(fileURLToPath(new URL(`../public${ITEM_DB.lucky_coin.img}`, import.meta.url))), ITEM_DB.lucky_coin.img);
});

test('each exploration has six unique choices; repeated, invalid and modal-blocked actions consume no AP', () => {
  for (const [stage, definition] of Object.entries(EXPLORATION_STAGES)) {
    assert.equal(definition.points.length, 6); assert.equal(new Set(definition.points.map((point) => point.id)).size, 6);
    const game = harness(stage);
    const method = { STAGE_1_CAR6: 'examineCar6Point', STAGE_2_TUNNEL: 'examineTunnelPoint', STAGE_3_PLATFORM: 'examinePlatformPoint', STAGE_4_MALL: 'examineMallPoint' }[stage];
    const first = definition.points[0].id;
    game.handlers()[method]('invalid'); assert.equal(game.state.ap, 3);
    game.handlers()[method](first); assert.equal(game.state.ap, 2);
    game.handlers()[method](definition.points[1].id); assert.equal(game.state.ap, 2);
    game.drain(); game.handlers()[method](first); assert.equal(game.state.ap, 2);
  }
});

test('last AP wrench reward appears and permits escape; no wrench ends at BAD 1', () => {
  for (const ownsWrench of [true, false]) {
    const game = harness('STAGE_1_CAR6');
    for (const id of ['p3_valve', 'p6_floor']) { game.handlers().examineCar6Point(id); game.drain(); }
    game.handlers().examineCar6Point(ownsWrench ? 'p4_shelf' : 'p1_padding');
    if (ownsWrench) assert.equal(game.state.activeModalText.rewardItems[0].id, 'wrench');
    game.drain();
    assert.equal(game.state.stage, ownsWrench ? 'STAGE_2_TUNNEL' : 'ENDING');
    if (!ownsWrench) assert.equal(game.state.endingData.id, 'BAD_1');
  }
});

test('platform route requires three investigations and fake exit without anomalies produces BAD 2', () => {
  const game = harness('STAGE_3_PLATFORM');
  game.handlers().choosePlatformExit('EXIT_3'); assert.equal(game.state.activeModalText, null);
  for (const id of ['m2_vending', 'm5_acid', 'm6_breaker']) { game.handlers().examinePlatformPoint(id); game.drain(); }
  assert.equal(game.state.flags.anomalyCount, 0);
  game.handlers().choosePlatformExit('EXIT_3'); assert.match(game.state.activeModalText.image.src, /trap_exit/);
  game.drain(); assert.equal(game.state.endingData.id, 'BAD_2');
});

test('only the route-map clue permits the third exit after other anomalies', () => {
  const withoutMap = harness('STAGE_3_PLATFORM');
  for (const id of ['m2_vending', 'm3_mirror', 'm4_office']) { withoutMap.handlers().examinePlatformPoint(id); withoutMap.drain(); }
  assert.equal(withoutMap.state.flags.anomalyCount, 2);
  assert.equal(withoutMap.state.flags.clueFakeStation, false);
  withoutMap.handlers().choosePlatformExit('EXIT_3'); withoutMap.drain();
  assert.equal(withoutMap.state.endingData.id, 'BAD_2');

  const withMap = harness('STAGE_3_PLATFORM');
  for (const id of ['m1_map', 'm2_vending', 'm5_acid']) { withMap.handlers().examinePlatformPoint(id); withMap.drain(); }
  assert.equal(withMap.state.flags.clueFakeStation, true);
  withMap.handlers().choosePlatformExit('EXIT_3'); withMap.drain();
  assert.equal(withMap.state.stage, 'STAGE_4_MALL');
});

test('real success route traverses Stage 0 to six-choice stages and all three final phases', () => {
  const game = harness(); game.handlers().handleSelectArchetype(ARCHETYPES[0], 'F'); game.handlers().handleRollCondition(); game.drain();
  for (const [method, ids] of [
    ['examineCar6Point', ['p4_shelf', 'p3_valve', 'p6_floor']],
    ['examineTunnelPoint', ['t1_recess', 't3_cart', 't2_phone']],
    ['examinePlatformPoint', ['m1_map', 'm4_office', 'm6_breaker']],
  ]) for (const id of ids) { game.handlers()[method](id); game.drain(); }
  game.handlers().choosePlatformExit('BREAKER');
  for (const id of ['c1_store', 'c3_cctv', 'c5_pharmacy']) { game.handlers().examineMallPoint(id); game.drain(); }
  assert.equal(game.state.stage, 'STAGE_5_VENT');
  game.handlers().handleStage5Action('TOOL_WRENCH'); game.drain();
  assert.equal(game.state.ventPhase, 2); assert.equal(game.state.turnLimit, 2);
  game.handlers().handleVentDefense('LANTERN'); game.drain();
  assert.equal(game.state.ventPhase, 3); assert.equal(game.state.turnLimit, 2);
  game.handlers().handleVentEscape('COMBO');
  assert.equal(game.state.endingData.id, 'TRUE');
});

test('missing tools and wrong final phases do not alter turns or grant success', () => {
  const game = harness('STAGE_5_VENT');
  for (const approach of ['TOOL_WRENCH', 'STR']) game.handlers().handleStage5Action(approach);
  game.handlers().handleVentDefense('LANTERN'); game.handlers().handleVentEscape('COMBO');
  assert.equal(game.state.turnLimit, 3); assert.equal(game.state.ventPhase, 1); assert.equal(game.state.activeModalText, null);
  game.update('ventPhase', 2);
  for (const approach of ['LANTERN', 'EXTINGUISHER', 'CUTTER']) game.handlers().handleVentDefense(approach);
  assert.equal(game.state.turnLimit, 3); assert.equal(game.state.ventPhase, 2);
});

test('both zero-turn defenses preserve last turn; last-turn escape succeeds', () => {
  for (const [item, approach] of [[I.LANTERN, 'LANTERN'], [I.EXTINGUISHER, 'EXTINGUISHER']]) {
    const game = harness('STAGE_5_VENT'); game.update('ventPhase', 2); game.update('turnLimit', 1); game.items(item, I.WRENCH, I.CROWBAR);
    game.handlers().handleVentDefense(approach); game.drain();
    assert.equal(game.state.turnLimit, 1); assert.equal(game.state.ventPhase, 3);
    game.handlers().handleVentDefense(approach); assert.equal(game.state.turnLimit, 1);
    game.handlers().handleVentEscape('COMBO'); assert.equal(game.state.turnLimit, 0); assert.equal(game.state.endingData.id, 'TRUE');
  }
});

test('final turn exhaustion is terminal on fan, defense and failed manhole', () => {
  for (const phase of [1, 2, 3]) {
    const game = harness('STAGE_5_VENT'); game.update('ventPhase', phase); game.update('turnLimit', 1); game.outcome(false);
    if (phase === 1) game.handlers().handleStage5Action('INT');
    if (phase === 2) game.handlers().handleVentDefense('NONE');
    if (phase === 3) game.handlers().handleVentEscape('STR');
    game.drain(); assert.equal(game.state.endingData.id, 'BAD_3'); assert.equal(game.state.turnLimit, 0);
  }
});

test('HP or SAN collapse ends the game; fear immunity actually prevents SAN loss', () => {
  for (const field of ['hp', 'san']) {
    const game = harness('STAGE_5_VENT'); game.update('ventPhase', 2);
    game.update('player', (player) => ({ ...player, [field]: 1 }));
    game.handlers().handleVentDefense('NONE'); game.drain();
    assert.equal(game.state.endingData.id, 'BAD_3'); assert.equal(game.state.player[field], 0);
  }
  const player = { ...createInitialGameState().player, trait: '잃을 게 없음' };
  assert.equal(applyDamage(player, 3, 4).san, 15); assert.equal(applyDamage(player, 3, 4).hp, 17);
});

test('gloves prevent acid contact and reduce electrical injury; CCTV lowers real fan DC', () => {
  for (const gloves of [true, false]) {
    const game = harness('STAGE_3_PLATFORM'); game.items(...(gloves ? [I.RUBBER_GLOVES] : []));
    game.handlers().examinePlatformPoint('m5_acid'); assert.equal(game.state.player.hp, gloves ? 20 : 18);
    assert.ok(game.state.player.inventory.some((item) => item.id === 'acid_vial'));
    game.drain(); game.update('stage', 'STAGE_2_TUNNEL'); game.update('examinedPoints', []); game.outcome(false);
    const before = game.state.player.hp;
    game.handlers().examineTunnelPoint('t4_rail'); assert.equal(game.state.player.hp, before - (gloves ? 2 : 6));
  }
  const game = harness('STAGE_5_VENT');
  game.update('flags', (flags) => ({ ...flags, knows_fan_circuit: true }));
  game.handlers().handleStage5Action('INT'); assert.equal(game.checks[0].dc, 9);
});

test('acid fan method consumes only acid and glove protection applies', () => {
  const game = harness('STAGE_5_VENT'); game.items(I.ACID_VIAL, I.RUBBER_GLOVES);
  game.handlers().handleStage5Action('TOOL_WRENCH'); game.drain();
  assert.equal(game.state.player.hp, 20); assert.equal(game.state.ventPhase, 2);
  assert.deepEqual(game.state.player.inventory.map((item) => item.id), ['rubber_gloves']);
});

test('inventory rewards never silently disappear and consumables require ownership and clamp recovery', () => {
  const player = { ...createInitialGameState().player, inventory: [I.WRENCH, I.LANTERN, I.CROWBAR, I.CUTTER, I.PHONE] };
  const rewarded = grantItems(player, [I.BANDAGE, I.WRENCH]); assert.equal(rewarded.inventory.length, 6);
  const game = harness('STAGE_4_MALL'); game.update('player', (current) => ({ ...current, hp: 18, san: 14 }));
  game.handlers().handleUseItem('bandage'); assert.equal(game.state.player.hp, 18);
  game.items(I.BANDAGE, I.CANDY); game.handlers().handleUseItem('bandage'); assert.equal(game.state.player.hp, 20);
  game.handlers().handleUseItem('candy'); assert.equal(game.state.player.san, 15); assert.equal(game.state.player.inventory.length, 0);
  game.handlers().handleUseItem('bandage'); assert.equal(game.state.player.hp, 20);
});

test('escape boundaries require both HP and SAN; zeros can never award a surviving ending', () => {
  for (const [hp, san, id] of [[12, 8, 'TRUE'], [11, 8, 'GOOD'], [8, 5, 'GOOD'], [8, 4, 'NORMAL'], [7, 5, 'NORMAL'], [0, 15, 'BAD_3'], [20, 0, 'BAD_3']]) {
    assert.equal(getEscapeEnding({ hp, san }), id, `${hp}/${san}`);
  }
});

test('ending collection rejects malformed JSON, objects, unknown ids and duplicates', () => {
  for (const raw of ['broken', '{}', 'null', '123']) assert.deepEqual(parseEndingCollection(raw), []);
  assert.deepEqual(parseEndingCollection('["TRUE","TRUE","GOOD","FAKE",7,{}]'), ['TRUE', 'GOOD']);
});
