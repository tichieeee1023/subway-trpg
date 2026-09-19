import { ENDING_DEFINITIONS, getEscapeEnding } from '../../data/endingDB.js';
import { ITEM_DATABASE as I } from '../../data/itemDB.js';
import { applyDamage, canAct, checkCollapse, finishGame, hasItem } from '../gameRules.js';

export function createStage5Handlers(context) {
  const { getState, setPlayer, setTurnLimit, setVentPhase, setFlags, setActiveModalText, openDiceCheck, addLog, triggerScreenEffect = () => {} } = context;
  const ready = (phase) => {
    const state = getState();
    return state.stage === 'STAGE_5_VENT' && state.ventPhase === phase && state.turnLimit > 0 && canAct(state);
  };
  const afterAction = (stateOverride = null) => {
    const state = stateOverride ?? getState();
    const checkContext = stateOverride ? { ...context, getState: () => state } : context;
    if (!checkCollapse(checkContext) && state.turnLimit <= 0) finishGame(context, 'BAD_3');
  };
  const showEquipment = (item, kind, body, onClose, extra = {}) => setActiveModalText({
    title: kind + ' · ' + item.name, tag: kind, illustration: item, body, onClose, ...extra,
  });
  const commit = ({ phase, cost = 1, hp = 0, san = 0, title, body, consume, emptyItem, flags = {}, onClose = afterAction }) => {
    setTurnLimit((turns) => Math.max(0, turns - cost));
    setVentPhase(phase);
    if (phase === 2) triggerScreenEffect('electric', 480);
    if (phase === 3) triggerScreenEffect('impact', 420);
    setFlags((previous) => ({ ...previous, ...flags }));
    setPlayer((player) => {
      const updated = applyDamage(player, hp, san);
      const inventory = consume ? updated.inventory.filter((item) => item.id !== consume) : updated.inventory;
      return { ...updated, inventory: emptyItem ? inventory.map((item) => item.id === emptyItem ? { ...item, empty: true } : item) : inventory };
    });
    addLog(`${title} · ${cost}턴 소모`);
    setActiveModalText({ title, body: body + '\n\n' + (cost === 0 ? '턴 소모 없음.' : cost + '턴 소모.'), onClose });
  };
  const handleStage5Action = (approach) => {
    if (!ready(1)) return;
    const state = getState();
    const toolByAction = { TOOL_WRENCH: 'wrench', TOOL_MULTITOOL: 'multitool', TOOL_ACID_VIAL: 'acid_vial' };
    const tool = toolByAction[approach];
    if (tool) {
      if (!hasItem(state, tool)) return;
      const finishToolUse = () => {
        const gloves = hasItem(getState(), 'rubber_gloves');
        const toolBody = tool === 'acid_vial'
          ? '산성액이 베어링을 녹이며 배기팬을 멈췄다.' + (gloves ? ' 산성 점액 채취병은 소모되었다.' : ' 튄 점액이 맨손에 닿았다. HP -2. 산성 점액 채취병은 소모되었다.')
          : tool === 'multitool'
            ? '마지막 릴레이 배선을 뽑자 모터음이 낮아졌다. 배기팬이 서서히 멎었다.'
            : '6호차 밸브를 열던 비상 스패너로 전원 볼트를 풀었다. 배기팬이 멈췄다.';
        const complete = () => commit({ phase: 2, consume: tool === 'acid_vial' ? tool : undefined,
          hp: tool === 'acid_vial' && !gloves ? 2 : 0, flags: { fanStopped: true },
          title: '배기팬 정지 성공', body: toolBody });
        if (tool !== 'acid_vial') { complete(); return; }
       setActiveModalText({
  title: '산성액이 튀었다',
  body: '베어링이 녹아내리는 순간 산성액이 바깥으로 튀었다.',
          onClose: () => {
            if (!gloves) { complete(); return; }
            showEquipment(I.RUBBER_GLOVES, '장비 효과', '산성액이 손등으로 튀었다. 두꺼운 고무장갑이 피부에 닿기 전에 막아냈다.',
              complete, { modifiers: [{ label: '산성액 접촉 피해', from: 'HP -2', to: 'HP 0', tone: 'damage' }] });
          } });
      };
      const item = { wrench: I.WRENCH, multitool: I.MULTITOOL, acid_vial: I.ACID_VIAL }[tool];
      const kind = tool === 'wrench' ? '장비 재사용' : '장비 사용';
      const useText = tool === 'wrench'
  ? '6호차에서 사용했던 비상 스패너를 꺼냈다. 전원 볼트에 걸고 온몸의 힘을 실었다.'
  : tool === 'multitool'
    ? '접이식 멀티툴을 펼쳤다. 좁은 틈으로 드라이버를 밀어 넣어 릴레이 배선을 분리했다.'
    : '채취병을 열고 산성액을 회전축 베어링 틈에 흘려 넣었다.';
      showEquipment(item, kind, useText, finishToolUse);
      return;
    }
    if (!['INT', 'STR', 'DEX'].includes(approach)) return;
    if (approach === 'STR' && !hasItem(state, 'crowbar', 'laptop_bag', 'tumbler', 'extinguisher')) return;
    const dc = approach === 'INT' ? (state.flags.knows_fan_circuit ? 9 : 12) : approach === 'STR' ? 11 : 14;
    const successTitle = approach === 'DEX' ? '회전 날개 통과 성공' : '배기팬 정지 성공';
    const successBody = approach === 'INT'
      ? state.flags.knows_fan_circuit
        ? 'CCTV에서 확인한 위치의 비상 릴레이를 차단했다. 회전하던 팬이 멈추며 사다리 통로가 열렸다.'
        : '비상 릴레이를 찾아 차단했다. 회전하던 팬이 멈추며 사다리 통로가 열렸다.'
      : approach === 'STR'
        ? '회전축을 강제로 멈췄다. 배기팬이 멈추며 사다리 통로가 열렸다.'
        : '회전 날개 사이를 빠져나왔다. 사다리 아래에서 촉수가 기어오고 있다.';
    const failureTitle = approach === 'DEX' ? '회전 날개 통과 실패' : '배기팬 정지 실패';
    const roll = () => openDiceCheck(approach + ' · 배기팬 ' + (approach === 'INT' ? '회로 차단' : approach === 'STR' ? '회전축 파괴' : '날개 틈 도약'), approach, dc,
      () => commit({ phase: 2, flags: approach === 'DEX' ? {} : { fanStopped: true }, title: successTitle, body: successBody }),
      () => {
        const gloves = approach === 'INT' && hasItem(getState(), 'rubber_gloves');
        const hp = approach === 'DEX' ? 8 : approach === 'STR' ? 6 : gloves ? 2 : 5;
        if (gloves) {
          commit({ phase: 1, hp: 0, title: failureTitle, body: '배선을 잘못 건드렸다. 푸른 스파크가 손바닥을 태웠다.',
            onClose: () => {
              showEquipment(I.RUBBER_GLOVES, '장비 효과', '전류가 장갑을 타고 튀었다. 두꺼운 고무층이 충격을 줄여 손끝의 마비가 빠르게 약해졌다.',
                () => {
                  const current = getState();
                  const injuredPlayer = applyDamage(current.player, hp, 0);
                  setPlayer((player) => applyDamage(player, hp, 0));
                  afterAction({ ...current, player: injuredPlayer });
                }, { modifiers: [{ label: '감전 피해', from: 'HP -5', to: 'HP -' + hp, tone: 'damage' }] });
            } });
          return;
        }
        const failureBody = approach === 'INT' ? '배선을 잘못 건드렸다. 푸른 스파크가 손바닥을 태웠다. HP -5.'
          : approach === 'STR' ? '회전축이 튕겨 나오며 금속 파편에 부딪혔다. HP -6.'
            : '도약이 늦었다. 회전 날개에 몸을 스쳤다. HP -8.';
        commit({ phase: 1, hp, title: failureTitle, body: failureBody });
      });
    if (approach === 'INT' && state.flags.knows_fan_circuit) {
      setActiveModalText({ title: 'CCTV에서 본 위치가 떠올랐다', tag: '단서 회상',
        body: 'CCTV에서 확인했던 배기팬과 비상 릴레이 위치가 떠올랐다. 어디를 건드려야 할지 이미 알고 있다.',
        modifiers: [{ label: 'INT 판정 난이도', from: 'DC 12', to: 'DC ' + dc, tone: 'benefit' }], onClose: roll });
      return;
    }
    if (approach === 'STR' && hasItem(state, 'crowbar')) {
      showEquipment(I.CROWBAR, '장비 사용', '쇠지렛대의 납작한 끝을 고속 회전하는 축 틈에 밀어 넣었다. 손잡이를 두 손으로 움켜쥐고 체중을 실었다.', roll);
      return;
    }
    roll();
  };
  const handleVentDefense = (approach) => {
    if (!ready(2)) return;
    const state = getState();
    if (approach === 'LANTERN' || approach === 'EXTINGUISHER') {
      const id = approach === 'LANTERN' ? 'lantern' : 'extinguisher';
      if (!hasItem(state, id)) return;
      const extinguisher = state.player.inventory.find((item) => item.id === 'extinguisher');
      if (approach === 'EXTINGUISHER' && extinguisher.empty) return;
      const item = approach === 'LANTERN' ? I.LANTERN : I.EXTINGUISHER;
      const useText = approach === 'LANTERN'
        ? '방수 랜턴을 켰다. 강한 백색광이 갱도를 비추자 검은 촉수들이 움츠러들었다.'
        : '안전핀을 뽑고 통로 안으로 분말을 분사했다. 촉수들이 벽 쪽으로 물러났다.';
      showEquipment(item, '장비 사용', useText, () => commit({ phase: 3, cost: 0, emptyItem: approach === 'EXTINGUISHER' ? 'extinguisher' : undefined, flags: { creatureBlocked: true }, title: '촉수 견제 성공',
        body: approach === 'LANTERN' ? '촉수들이 빛을 피해 물러난 틈에 곧바로 사다리를 올랐다.' : '분말에 밀린 촉수 사이로 사다리를 올랐다. 빈 소화기 통은 아직 사용할 수 있다.' }));
    } else if (approach === 'CUTTER') {
      if (!hasItem(state, 'cutter')) return;
      openDiceCheck('커터칼 · 발목을 감은 촉수 절단', 'DEX', 10,
        () => commit({ phase: 3, flags: { creatureBlocked: true }, title: '촉수를 잘라냈다', body: '발목을 감은 촉수를 잘라내고 곧바로 사다리를 올랐다.' }),
        () => commit({ phase: 3, hp: 6, san: 3, title: '촉수 절단 실패', body: '촉수를 완전히 끊지 못했다. 몸을 휘감은 촉수를 떼어내며 간신히 사다리를 올랐다. HP -6, SAN -3.' }));
    } else if (approach === 'NONE') {
      commit({ phase: 3, hp: 7, san: 4, title: '맨몸으로 사다리를 오른다', body: '달라붙는 촉수를 손으로 떼어내며 사다리를 올랐다. HP -7, SAN -4.' });
    }
  };
  const handleVentEscape = (approach, selectedStrikerId = null) => {
    if (!ready(3) || !['COMBO', 'STR'].includes(approach)) return;
    const state = getState();
    const crowbar = hasItem(state, 'crowbar');
    const strikerId = ['wrench', 'tumbler', 'extinguisher'].includes(selectedStrikerId) && hasItem(state, selectedStrikerId)
      ? selectedStrikerId
      : ['wrench', 'tumbler', 'extinguisher'].find((id) => hasItem(state, id));
    const escape = () => {
      setTurnLimit((turns) => Math.max(0, turns - 1));
      triggerScreenEffect('surface-light', 1100);
      const endingId = getEscapeEnding(getState().player);
      const endingDesc = hasItem(getState(), 'clue_skin')
        ? ENDING_DEFINITIONS[endingId].desc + '\n\n가방 안 비닐봉지에는 역무원실에서 챙긴 피부 조직이 남아 있었다.\n\n적어도 오늘 밤의 일이 내 머릿속에서만 벌어진 일은 아니었다.'
        : undefined;
      finishGame(context, endingId, endingDesc);
    };
    if (approach === 'COMBO') {
      if (!crowbar || !strikerId) return;
      addLog('쇠지렛대와 타격 도구를 함께 사용해 맨홀을 열었다.');
      const striker = { wrench: I.WRENCH, tumbler: I.TUMBLER, extinguisher: I.EXTINGUISHER }[strikerId];
      const extinguisher = getState().player.inventory.find((item) => item.id === 'extinguisher');
      const secondToolText = strikerId === 'extinguisher'
        ? extinguisher.empty ? '분말을 다 쓴 소화기 통으로 쇠지렛대 손잡이를 힘껏 내리쳤다.' : '휴대용 소화기 통으로 쇠지렛대 손잡이를 힘껏 내리쳤다.'
        : strikerId === 'wrench' ? '비상 스패너로 쇠지렛대 손잡이를 힘껏 내리쳤다.' : '묵직한 텀블러로 쇠지렛대 손잡이를 힘껏 내리쳤다.';
      setActiveModalText({ title: '쇠지렛대 + ' + striker.name, tag: '도구 조합',
        illustrations: [I.CROWBAR, striker],
        body: '쇠지렛대를 맨홀 틈에 깊숙이 끼웠다. ' + secondToolText + '\n\n쾅!\n녹슨 뚜껑이 크게 들썩였다.',
        onClose: escape });
    } else {
      const roll = () => openDiceCheck('맨홀 뚜껑 열기', 'STR', crowbar ? 9 : 14, escape,
        () => commit({ phase: 3, hp: 3, title: '맨홀 개방 실패', body: '녹슨 뚜껑이 꿈쩍하지 않는다. 어깨에 통증이 번진다. HP -3.' }));
      if (crowbar) {
        showEquipment(I.CROWBAR, '장비 사용', '쇠지렛대의 납작한 끝을 맨홀 틈에 깊숙이 밀어 넣었다. 손잡이에 몸무게를 실어 녹슨 뚜껑을 들어 올릴 준비를 했다.', roll,
          { modifiers: [{ label: 'STR 판정 난이도', from: 'DC 14', to: 'DC 9', tone: 'benefit' }] });
      } else roll();
    }
  };
  return { handleStage5Action, handleVentDefense, handleVentEscape, handlePushManhole: () => handleVentEscape('STR') };
}
