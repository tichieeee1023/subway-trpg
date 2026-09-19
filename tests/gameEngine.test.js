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
import { ITEM_ASSET_FILES, ITEM_DATABASE as I, ITEM_DB } from '../src/data/itemDB.js';
import { EXPLORATION_STAGES } from '../src/data/explorationDB.js';
import { ENDING_DEFINITIONS, getEscapeEnding } from '../src/data/endingDB.js';
import { getEndingJobEpilogue } from '../src/data/endingJobEpilogues.js';
import { getFakeStationActions } from '../src/data/fakeStationActions.js';
import { advanceStoryModal } from '../src/utils/storyFlow.js';
import { applyDamage, grantItems } from '../src/state/gameRules.js';
import { parseEndingCollection } from '../src/utils/endingCollection.js';

test('every ending has a distinct epilogue for every archetype', () => {
  const epilogues = Object.keys(ENDING_DEFINITIONS).flatMap((endingId) =>
    ARCHETYPES.map(({ id }) => getEndingJobEpilogue(id, endingId))
  );
  assert.equal(epilogues.length, 30);
  assert.equal(epilogues.every(Boolean), true);
  assert.equal(new Set(epilogues).size, epilogues.length);
});

function harness(stage = 'SURVEY') {
  let state = { ...createInitialGameState(), stage };
  let succeed = true;
  let roll = 14;
  const checks = [];
  const logs = [];
  const update = (field, value) => { state = gameReducer(state, { type: GAME_ACTIONS.UPDATE_FIELD, field, value }); };
  const context = {
    getState: () => state, sfx: new Proxy({}, { get: () => () => {} }), addLog: (entry) => logs.push(entry), triggerGlitch: () => {},
    dispatch: (action) => { state = gameReducer(state, action); },
    openDiceCheck: (title, stat, dc, success, failure) => { checks.push({ title, stat, dc }); (succeed ? success : failure)(); },
    openConditionDice: (resolve) => resolve(roll),
  };
  for (const field of Object.keys(state)) context[`set${field[0].toUpperCase()}${field.slice(1)}`] = (value) => update(field, value);
  return {
    get state() { return state; }, checks, logs, update,
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

test('all linked portraits/scenes/cards and item graphics resolve to existing WebP files', () => {
  assert.equal(Object.keys(PUBLIC_ASSET_FILES).length, 29); assert.equal(Object.keys(I).length, 26);
  for (const path of Object.keys(PUBLIC_ASSET_FILES)) {
    assert.match(path, /\.webp$/); assert.ok(existsSync(fileURLToPath(new URL(`../${path}`, import.meta.url))), path);
  }
  assert.equal(Object.keys(ITEM_ASSET_FILES).length, 31);
  for (const path of Object.keys(ITEM_ASSET_FILES)) {
    assert.match(path, /\.webp$/); assert.ok(existsSync(fileURLToPath(new URL(`../${path}`, import.meta.url))), path);
  }
  for (const item of Object.values(I)) {
    assert.match(item.img, /\.webp$/); assert.ok(existsSync(fileURLToPath(new URL(`../public${item.img}`, import.meta.url))), item.img);
  }
  assert.match(ITEM_DB.lucky_coin.img, /item_gear_coin\.webp$/);
  assert.ok(existsSync(fileURLToPath(new URL(`../public${ITEM_DB.lucky_coin.img}`, import.meta.url))), ITEM_DB.lucky_coin.img);
  assert.equal(I.KEY_BRASS, undefined);
  assert.equal(I.CLUE_SHOES, undefined);
  assert.equal(I.RECEIPT, undefined);
  assert.equal(ITEM_DB.master_key, undefined);
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
    if (ownsWrench) {
      game.close();
      assert.equal(game.state.activeModalText.title, '7호차 격벽 붕괴');
      game.close();
      assert.equal(game.state.activeModalText.illustration.id, 'wrench');
      assert.match(game.state.activeModalText.title, /장비 재사용/);
    }
    game.drain();
    assert.equal(game.state.stage, ownsWrench ? 'STAGE_2_TUNNEL' : 'ENDING');
    if (!ownsWrench) assert.equal(game.state.endingData.id, 'BAD_1');
  }
});

test('platform route requires three investigations and an unrecognized false exit starts the last resistance', () => {
  const game = harness('STAGE_3_PLATFORM');
  game.handlers().choosePlatformExit('EXIT_3'); assert.equal(game.state.activeModalText, null);
  for (const id of ['m2_vending', 'm5_acid', 'm6_breaker']) { game.handlers().examinePlatformPoint(id); game.drain(); }
  assert.equal(game.state.flags.anomalyCount, 0);
  game.handlers().choosePlatformExit('EXIT_3');
  assert.equal(game.state.activeModalText.title, '계단을 오르려는 순간');
  assert.match(game.state.activeModalText.image.src, /trap_exit/);
  assert.equal(game.state.flags.fakeStationResistance, true);
  game.drain(); assert.equal(game.state.endingData, null);
  assert.equal(game.state.flags.fakeStationPhase, 1);
});

test('powerbank immediately charges the phone, while dissolved shoes remain an investigation flag', () => {
  const game = harness('STAGE_1_CAR6');
  game.handlers().examineCar6Point('p1_padding');
  assert.equal(game.state.player.battery, 40);
  assert.deepEqual(game.state.player.inventory.map((item) => item.id), ['cutter']);
  assert.deepEqual(game.state.activeModalText.illustrations.map((item) => item.id), ['powerbank', 'cutter']);
  assert.deepEqual(game.state.activeModalText.illustrations.map((item) => item.caption), ['즉시 사용 · 보조배터리', '획득 · 소형 커터칼']);
  assert.deepEqual(game.state.activeModalText.rewardItems, []);
  assert.deepEqual(game.state.activeModalText.modifiers[0], { label: '스마트폰 배터리', from: '20%', to: '40%', tone: 'benefit' });
  assert.equal(game.state.activeModalText.illustrations.some((item) => item.id === 'powerbank' && item.caption.startsWith('획득')), false);
  game.drain();

  const clue = harness('STAGE_1_CAR6');
  clue.handlers().examineCar6Point('p6_floor');
  assert.equal(clue.state.flags.knows_dissolution, true);
  assert.equal(clue.state.player.inventory.some((item) => item.id === 'clue_shoes'), false);
});

test('false exit opens a two-step resistance sequence and successful items affect later inventory', () => {
  const game = harness('STAGE_3_PLATFORM'); game.update('ap', 0); game.items(I.EXTINGUISHER, ITEM_DB.tumbler, I.CROWBAR);
  game.handlers().choosePlatformExit('EXIT_3'); game.drain();
  assert.equal(game.state.flags.fakeStationPhase, 1);

  game.handlers().handleFakeStationResistance('EXTINGUISHER');
  assert.equal(game.state.player.inventory.find((item) => item.id === 'extinguisher').empty, true);
  game.close();
  assert.equal(game.state.flags.fakeStationPhase, 2);
  assert.equal(game.state.flags.fakeStationEscapeBonus, 4);
  assert.equal(game.state.activeModalText.title, '빠져나갈 틈이 생겼다');
  game.close();

  game.handlers().handleFakeStationResistance('TUMBLER');
  assert.equal(game.state.player.inventory.some((item) => item.id === 'tumbler'), false);
  game.close();
  assert.equal(game.state.stage, 'STAGE_3_PLATFORM');
  assert.equal(game.state.activeModalText.title, '환승 통로로 탈출했다');
  assert.equal(game.state.flags.fakeStationSurvived, true);
  assert.equal(game.state.flags.fakeStationResistance, true);
  game.close();
  assert.equal(game.state.stage, 'STAGE_4_MALL');
  assert.equal(game.state.endingData, null);
  assert.equal(game.state.player.hp, 17); assert.equal(game.state.player.san, 13);
  assert.equal(game.state.player.inventory.find((item) => item.id === 'extinguisher').empty, true);
  assert.equal(game.state.player.inventory.some((item) => item.id === 'crowbar'), true);
  assert.equal(game.state.activeModalText, null);
});

test('failed resistance preserves BAD_2 and bare hands remain available without items', () => {
  const game = harness('STAGE_3_PLATFORM'); game.update('ap', 0); game.items(); game.outcome(false);
  game.handlers().choosePlatformExit('EXIT_3'); game.drain();
  const actions = getFakeStationActions(1, game.state.player.inventory, 0, game.state.flags);
  assert.deepEqual(actions.map((action) => action.id), ['HANDS_STR_1', 'HANDS_DEX_1']);
  game.handlers().handleFakeStationResistance('HANDS_STR_1');
  assert.equal(game.state.activeModalText.title, '탈출 실패');
  assert.equal(game.state.endingData, null);
  game.close();
  assert.equal(game.state.endingData.id, 'BAD_2');
  assert.equal(game.state.endingData.title, 'BAD END 2 : 02:40 AM, 마지막 반항');
  assert.match(game.state.endingData.desc, /끝까지 저항했지만/);
  assert.equal(game.state.flags.fakeStationFailed, true);
});

test('all job starting items have a situational use or existing consumable effect', () => {
  const available = (phase, arch) => getFakeStationActions(phase, arch.items, 0, {}).map((action) => action.itemId).filter(Boolean);
  assert.ok(available(1, ARCHETYPES[0]).includes('glasses'));
  assert.ok(available(2, ARCHETYPES[0]).includes('laptop_bag') === false);
  assert.ok(available(2, ARCHETYPES[1]).includes('tumbler'));
  assert.equal(ARCHETYPES[1].items.find((item) => item.id === 'protein_bar').consumable, true);
  assert.ok(available(2, ARCHETYPES[2]).includes('lanyard'));
  assert.ok(available(2, ARCHETYPES[2]).includes('running_shoes'));
  assert.ok(available(1, ARCHETYPES[3]).includes('metal_pen'));
  assert.equal(ARCHETYPES[3].items.find((item) => item.id === 'candy').consumable, true);
  assert.ok(available(2, ARCHETYPES[4]).includes('lotto'));
  assert.ok(available(2, ARCHETYPES[4]).includes('lucky_coin'));
});

test('only the route-map clue permits the third exit after other anomalies', () => {
  const withoutMap = harness('STAGE_3_PLATFORM');
  for (const id of ['m2_vending', 'm3_mirror', 'm4_office']) { withoutMap.handlers().examinePlatformPoint(id); withoutMap.drain(); }
  assert.equal(withoutMap.state.flags.anomalyCount, 2);
  assert.equal(withoutMap.state.flags.clueFakeStation, false);
  withoutMap.handlers().choosePlatformExit('EXIT_3'); withoutMap.drain();
  assert.equal(withoutMap.state.endingData, null);
  assert.equal(withoutMap.state.flags.fakeStationResistance, true);

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
  game.handlers().handleStage5Action('TOOL_WRENCH');
  assert.equal(game.state.activeModalText.illustration.id, 'wrench');
  game.drain();
  assert.equal(game.state.ventPhase, 2); assert.equal(game.state.turnLimit, 2);
  game.handlers().handleVentDefense('LANTERN'); game.drain();
  assert.equal(game.state.ventPhase, 3); assert.equal(game.state.turnLimit, 2);
  game.handlers().handleVentEscape('COMBO');
  game.drain();
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

test('vent defense narration distinguishes lantern, extinguisher, cutter and bare hands', () => {
  const lantern = harness('STAGE_5_VENT'); lantern.update('ventPhase', 2); lantern.items(I.LANTERN);
  lantern.handlers().handleVentDefense('LANTERN');
  assert.equal(lantern.state.activeModalText.body, '방수 랜턴을 켰다. 강한 백색광이 갱도를 비추자 검은 촉수들이 움츠러들었다.');
  lantern.close();
  assert.match(lantern.state.activeModalText.body, /촉수들이 빛을 피해 물러난 틈에 곧바로 사다리를 올랐다/);

  const extinguisher = harness('STAGE_5_VENT'); extinguisher.update('ventPhase', 2); extinguisher.items(I.EXTINGUISHER);
  extinguisher.handlers().handleVentDefense('EXTINGUISHER');
  assert.equal(extinguisher.state.activeModalText.body, '안전핀을 뽑고 통로 안으로 분말을 분사했다. 촉수들이 벽 쪽으로 물러났다.');
  extinguisher.close();
  assert.match(extinguisher.state.activeModalText.body, /분말에 밀린 촉수 사이로 사다리를 올랐다/);
  assert.match(extinguisher.state.activeModalText.body, /빈 소화기 통은 아직 사용할 수 있다/);

  const cutter = harness('STAGE_5_VENT'); cutter.update('ventPhase', 2); cutter.items(I.CUTTER);
  cutter.handlers().handleVentDefense('CUTTER');
  assert.equal(cutter.state.activeModalText.title, '촉수를 잘라냈다');
  assert.equal(cutter.state.activeModalText.body.startsWith('발목을 감은 촉수를 잘라내고 곧바로 사다리를 올랐다.'), true);

  const cutterFailure = harness('STAGE_5_VENT'); cutterFailure.update('ventPhase', 2); cutterFailure.items(I.CUTTER); cutterFailure.outcome(false);
  cutterFailure.handlers().handleVentDefense('CUTTER');
  assert.match(cutterFailure.state.activeModalText.body, /촉수를 완전히 끊지 못했다. 몸을 휘감은 촉수를 떼어내며 간신히 사다리를 올랐다. HP -6, SAN -3\./);

  const bareHands = harness('STAGE_5_VENT'); bareHands.update('ventPhase', 2);
  bareHands.handlers().handleVentDefense('NONE');
  assert.equal(bareHands.state.activeModalText.title, '맨몸으로 사다리를 오른다');
  assert.match(bareHands.state.activeModalText.body, /달라붙는 촉수를 손으로 떼어내며 사다리를 올랐다. HP -7, SAN -4\./);
});

test('both zero-turn defenses preserve last turn; last-turn escape succeeds', () => {
  for (const [item, approach] of [[I.LANTERN, 'LANTERN'], [I.EXTINGUISHER, 'EXTINGUISHER']]) {
    const game = harness('STAGE_5_VENT'); game.update('ventPhase', 2); game.update('turnLimit', 1); game.items(item, I.WRENCH, I.CROWBAR);
    game.handlers().handleVentDefense(approach);
    assert.equal(game.state.activeModalText.illustration.id, item.id);
    assert.equal(game.state.ventPhase, 2);
    game.drain();
    assert.equal(game.state.turnLimit, 1); assert.equal(game.state.ventPhase, 3);
    game.handlers().handleVentDefense(approach); assert.equal(game.state.turnLimit, 1);
    game.handlers().handleVentEscape('COMBO'); game.drain();
    assert.equal(game.state.turnLimit, 0); assert.equal(game.state.endingData.id, 'TRUE');
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
  const acid = harness('STAGE_3_PLATFORM'); acid.items(I.RUBBER_GLOVES);
  acid.handlers().examinePlatformPoint('m5_acid');
  assert.equal(acid.state.player.hp, 20);
  assert.ok(acid.state.activeModalText.rewardItems.some((item) => item.id === 'acid_vial'));
  acid.close();
  assert.equal(acid.state.activeModalText.title, '산성액 접촉 위험');
  acid.close();
  assert.equal(acid.state.activeModalText.illustration.id, 'rubber_gloves');
  assert.deepEqual(acid.state.activeModalText.modifiers[0], { label: '산성액 접촉 피해', from: 'HP -2', to: 'HP 0', tone: 'damage' });
  assert.equal(acid.state.player.hp, 20);
  acid.drain();

  const unprotectedAcid = harness('STAGE_3_PLATFORM');
  unprotectedAcid.handlers().examinePlatformPoint('m5_acid');
  assert.equal(unprotectedAcid.state.player.hp, 18);
  unprotectedAcid.drain();

  const rail = harness('STAGE_2_TUNNEL'); rail.items(I.RUBBER_GLOVES); rail.outcome(false);
  const before = rail.state.player.hp;
  rail.handlers().examineTunnelPoint('t4_rail');
  assert.equal(rail.state.player.hp, before);
  assert.match(rail.state.activeModalText.body, /전류가 팔을 타고 올라왔다/);
  rail.close();
  assert.equal(rail.state.activeModalText.illustration.id, 'rubber_gloves');
  assert.deepEqual(rail.state.activeModalText.modifiers[0], { label: '감전 피해', from: 'HP -6', to: 'HP -2', tone: 'damage' });
  assert.equal(rail.state.player.hp, before);
  rail.close();
  assert.equal(rail.state.player.hp, before - 2);

  const game = harness('STAGE_5_VENT');
  game.update('flags', (flags) => ({ ...flags, knows_fan_circuit: true }));
  game.handlers().handleStage5Action('INT');
  assert.equal(game.checks.length, 0);
  assert.equal(game.state.activeModalText.title, 'CCTV에서 본 위치가 떠올랐다');
  assert.equal(game.state.activeModalText.body, 'CCTV에서 확인했던 배기팬과 비상 릴레이 위치가 떠올랐다. 어디를 건드려야 할지 이미 알고 있다.');
  assert.deepEqual(game.state.activeModalText.modifiers[0], { label: 'INT 판정 난이도', from: 'DC 12', to: 'DC 9', tone: 'benefit' });
  game.close();
  assert.equal(game.checks[0].dc, 9);
  assert.equal(game.state.activeModalText.title, '배기팬 정지 성공');
  assert.match(game.state.activeModalText.body, /CCTV에서 확인한 위치의 비상 릴레이를 차단했다/);
});

test('fan roll result text matches the chosen approach and omits retry instructions', () => {
  const resolve = (approach, success) => {
    const game = harness('STAGE_5_VENT');
    if (approach === 'STR') game.items(I.CROWBAR);
    game.outcome(success);
    game.handlers().handleStage5Action(approach);
    if (game.state.activeModalText?.tag === '장비 사용') game.close();
    return game;
  };

  const intSuccess = resolve('INT', true);
  assert.equal(intSuccess.state.activeModalText.title, '배기팬 정지 성공');
  assert.match(intSuccess.state.activeModalText.body, /비상 릴레이를 찾아 차단했다/);
  const strSuccess = resolve('STR', true);
  assert.equal(strSuccess.state.activeModalText.title, '배기팬 정지 성공');
  assert.match(strSuccess.state.activeModalText.body, /회전축을 강제로 멈췄다/);
  const dexSuccess = resolve('DEX', true);
  assert.equal(dexSuccess.state.activeModalText.title, '회전 날개 통과 성공');
  assert.match(dexSuccess.state.activeModalText.body, /회전 날개 사이를 빠져나왔다/);
  assert.equal(dexSuccess.state.flags.fanStopped, false);

  const intFailure = resolve('INT', false);
  assert.equal(intFailure.state.activeModalText.title, '배기팬 정지 실패');
  assert.equal(intFailure.state.activeModalText.body.startsWith('배선을 잘못 건드렸다.'), true);
  const strFailure = resolve('STR', false);
  assert.equal(strFailure.state.activeModalText.title, '배기팬 정지 실패');
  assert.match(strFailure.state.activeModalText.body, /회전축이 튕겨 나오며 금속 파편에 부딪혔다/);
  const dexFailure = resolve('DEX', false);
  assert.equal(dexFailure.state.activeModalText.title, '회전 날개 통과 실패');
  assert.match(dexFailure.state.activeModalText.body, /도약이 늦었다. 회전 날개에 몸을 스쳤다/);
  for (const game of [intFailure, strFailure, dexFailure]) assert.doesNotMatch(game.state.activeModalText.body, /다른 접근법/);
});

test('only the skin evidence changes the surviving ending text, not its ending id', () => {
  for (const ownsSkin of [false, true]) {
    const game = harness('STAGE_5_VENT'); game.update('ventPhase', 3); game.update('turnLimit', 3);
    game.items(I.CROWBAR, I.WRENCH, ...(ownsSkin ? [I.CLUE_SKIN] : []));
    game.handlers().handleVentEscape('COMBO', 'wrench');
    game.close();
    assert.equal(game.state.endingData.id, 'TRUE');
    assert.equal(game.state.endingData.desc.includes('역무원실에서 챙긴 피부 조직'), ownsSkin);
    if (!ownsSkin) assert.equal(game.state.endingData.desc, ENDING_DEFINITIONS.TRUE.desc);
  }
  const platform = harness('STAGE_3_PLATFORM'); platform.items(I.CLUE_SKIN);
  for (const id of ['m2_vending', 'm5_acid', 'm6_breaker']) { platform.handlers().examinePlatformPoint(id); platform.drain(); }
  assert.ok(platform.state.player.inventory.some((item) => item.id === 'clue_skin'));
  assert.equal(platform.state.player.inventory.some((item) => item.id === 'key_brass'), false);
});

test('acid fan method consumes only acid and glove protection applies', () => {
  const game = harness('STAGE_5_VENT'); game.items(I.ACID_VIAL, I.RUBBER_GLOVES);
  game.handlers().handleStage5Action('TOOL_ACID_VIAL');
  assert.equal(game.state.activeModalText.illustration.id, 'acid_vial');
  assert.ok(game.state.player.inventory.some((item) => item.id === 'acid_vial'));
  game.close();
  assert.equal(game.state.activeModalText.title, '산성액이 튀었다');
  game.close();
  assert.equal(game.state.activeModalText.illustration.id, 'rubber_gloves');
  assert.ok(game.state.player.inventory.some((item) => item.id === 'acid_vial'));
  game.close();
  assert.equal(game.state.activeModalText.title, '배기팬 정지 성공');
  game.drain();
  assert.equal(game.state.player.hp, 20); assert.equal(game.state.ventPhase, 2);
  assert.deepEqual(game.state.player.inventory.map((item) => item.id), ['rubber_gloves']);
});

test('multitool can be selected independently of the mandatory wrench', () => {
  const game = harness('STAGE_5_VENT'); game.items(I.WRENCH, I.MULTITOOL);
  game.handlers().handleStage5Action('TOOL_MULTITOOL');
  assert.equal(game.state.activeModalText.illustration.id, 'multitool');
  assert.equal(game.state.ventPhase, 1);
  game.close();
  assert.equal(game.state.ventPhase, 2);
  assert.equal(game.state.turnLimit, 2);
  assert.deepEqual(game.state.player.inventory.map((item) => item.id), ['wrench', 'multitool']);
});

test('fan failure queues the glove effect before injury and crowbar displays its real DC reduction', () => {
  const failed = harness('STAGE_5_VENT'); failed.items(I.RUBBER_GLOVES); failed.outcome(false);
  const before = failed.state.player.hp;
  failed.handlers().handleStage5Action('INT');
  assert.equal(failed.state.activeModalText.illustration, undefined);
  assert.equal(failed.state.player.hp, before);
  failed.close();
  assert.equal(failed.state.activeModalText.illustration.id, 'rubber_gloves');
  assert.equal(failed.state.player.hp, before);
  failed.close();
  assert.equal(failed.state.player.hp, before - 2);

  const crowbar = harness('STAGE_5_VENT'); crowbar.update('ventPhase', 3); crowbar.items(I.CROWBAR);
  crowbar.handlers().handleVentEscape('STR');
  assert.equal(crowbar.state.activeModalText.illustration.id, 'crowbar');
  assert.deepEqual(crowbar.state.activeModalText.modifiers[0], { label: 'STR 판정 난이도', from: 'DC 14', to: 'DC 9', tone: 'benefit' });
  assert.equal(crowbar.checks.length, 0);
  crowbar.close();
  assert.equal(crowbar.checks[0].title, '맨홀 뚜껑 열기');
  assert.equal(crowbar.checks[0].dc, 9);
  assert.equal(crowbar.state.endingData.id, 'TRUE');
});

test('extinguisher can be selected for the later crowbar combo and stays in inventory', () => {
  const game = harness('STAGE_5_VENT'); game.update('ventPhase', 3); game.items(I.CROWBAR, I.EXTINGUISHER);
  game.handlers().handleVentEscape('COMBO', 'extinguisher');
  assert.deepEqual(game.state.activeModalText.illustrations.map((item) => item.id), ['crowbar', 'extinguisher']);
  assert.equal(game.state.activeModalText.title, '쇠지렛대 + 휴대용 소화기');
  assert.equal(game.state.activeModalText.tag, '도구 조합');
  assert.match(game.state.activeModalText.body, /쇠지렛대를 맨홀 틈에 깊숙이 끼웠다/);
  assert.ok(game.logs.includes('쇠지렛대와 타격 도구를 함께 사용해 맨홀을 열었다.'));
  assert.equal(game.state.endingData, null);
  assert.equal(game.state.turnLimit, 3);
  game.close();
  assert.equal(game.state.turnLimit, 2);
  assert.equal(game.state.endingData.id, 'TRUE');
  assert.deepEqual(game.state.player.inventory.map((item) => item.id), ['crowbar', 'extinguisher']);
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
  for (const [hp, san, id] of [[14, 11, 'TRUE'], [13, 11, 'GOOD'], [6, 8, 'GOOD'], [6, 7, 'NORMAL'], [5, 15, 'NORMAL'], [20, 7, 'NORMAL'], [0, 15, 'BAD_3'], [20, 0, 'BAD_3']]) {
    assert.equal(getEscapeEnding({ hp, san }), id, `${hp}/${san}`);
  }
});

test('ending collection rejects malformed JSON, objects, unknown ids and duplicates', () => {
  for (const raw of ['broken', '{}', 'null', '123']) assert.deepEqual(parseEndingCollection(raw), []);
  assert.deepEqual(parseEndingCollection('["TRUE","TRUE","GOOD","FAKE",7,{}]'), ['TRUE', 'GOOD']);
});
