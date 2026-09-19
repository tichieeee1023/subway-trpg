import { getEscapeEnding } from '../../data/endingDB.js';
import { applyDamage, canAct, checkCollapse, finishGame, hasItem } from '../gameRules.js';

export function createStage5Handlers(context) {
  const { getState, setPlayer, setTurnLimit, setVentPhase, setFlags, setActiveModalText, openDiceCheck, addLog, triggerScreenEffect = () => {} } = context;
  const ready = (phase) => {
    const state = getState();
    return state.stage === 'STAGE_5_VENT' && state.ventPhase === phase && state.turnLimit > 0 && canAct(state);
  };
  const afterAction = () => {
    if (!checkCollapse(context) && getState().turnLimit <= 0) finishGame(context, 'BAD_3');
  };
  const commit = ({ phase, cost = 1, hp = 0, san = 0, title, body, consume, flags = {} }) => {
    setTurnLimit((turns) => Math.max(0, turns - cost));
    setVentPhase(phase);
    if (phase === 2) triggerScreenEffect('electric', 480);
    if (phase === 3) triggerScreenEffect('impact', 420);
    setFlags((previous) => ({ ...previous, ...flags }));
    setPlayer((player) => {
      const updated = applyDamage(player, hp, san);
      return consume ? { ...updated, inventory: updated.inventory.filter((item) => item.id !== consume) } : updated;
    });
    addLog(`${title} · ${cost}턴 소모`);
    setActiveModalText({ title, body: `${body}\n\n${cost === 0 ? '턴 소모 없음.' : `${cost}턴 소모.`}`, onClose: afterAction });
  };
  const handleStage5Action = (approach) => {
    if (!ready(1)) return;
    const state = getState();
    if (approach === 'TOOL_WRENCH') {
      const tool = ['wrench', 'multitool', 'acid_vial'].find((id) => hasItem(state, id));
      if (!tool) return;
      commit({ phase: 2, consume: tool === 'acid_vial' ? tool : undefined, hp: tool === 'acid_vial' && !hasItem(state, 'rubber_gloves') ? 2 : 0,
        flags: { fanStopped: true }, title: '도구 정공법 — 배기팬 정지',
        body: tool === 'acid_vial' ? '채취병의 산성액을 베어링에 부었다. 금속이 녹으며 배기팬이 멈췄다. 채취병은 소모되었다.' : tool === 'multitool' ? '멀티툴로 릴레이 배선을 분리했다. 배기팬이 서서히 멎는다.' : '비상 스패너로 메인 볼트를 풀어 배기팬을 무소음 차단했다.' });
      return;
    }
    if (!['INT', 'STR', 'DEX'].includes(approach)) return;
    if (approach === 'STR' && !hasItem(state, 'crowbar', 'laptop_bag', 'tumbler', 'extinguisher')) return;
    const dc = approach === 'INT' ? (state.flags.knows_fan_circuit ? 9 : 12) : approach === 'STR' ? 11 : 14;
    openDiceCheck(`${approach} · 배기팬 ${approach === 'INT' ? '회로 차단' : approach === 'STR' ? '회전축 파괴' : '날개 틈 도약'}`, approach, dc,
      () => commit({ phase: 2, flags: { fanStopped: true }, title: '배기팬 구간 돌파', body: '회전 날개를 통과했다. 사다리 아래에서 촉수가 발목을 더듬는다.' }),
      () => commit({ phase: 1, hp: approach === 'DEX' ? 8 : approach === 'STR' ? 6 : hasItem(getState(), 'rubber_gloves') ? 2 : 5,
        title: '배기팬 돌파 실패', body: approach === 'INT' && hasItem(getState(), 'rubber_gloves') ? '누전이 튀었지만 절연장갑이 충격을 막았다. HP -2.' : '날개와 파편에 부상을 입었다. 도구와 다른 접근법을 확인해야 한다.' }));
  };
  const handleVentDefense = (approach) => {
    if (!ready(2)) return;
    const state = getState();
    if (approach === 'LANTERN' || approach === 'EXTINGUISHER') {
      const id = approach === 'LANTERN' ? 'lantern' : 'extinguisher';
      if (!hasItem(state, id)) return;
      commit({ phase: 3, cost: 0, flags: { creatureBlocked: true }, title: '촉수 견제 성공',
        body: approach === 'LANTERN' ? '방수 랜턴의 고출력 섬광에 괴물이 움츠러든다. 시간을 잃지 않고 사다리를 올랐다.' : '소화기 분말이 갱도를 채우며 촉수를 밀어냈다. 빈 소화기 통은 맨홀 타격에 사용할 수 있다.' });
    } else if (approach === 'CUTTER') {
      if (!hasItem(state, 'cutter')) return;
      openDiceCheck('커터칼 · 발목을 감은 촉수 절단', 'DEX', 10,
        () => commit({ phase: 3, flags: { creatureBlocked: true }, title: '촉수 절단 성공', body: '칼날로 촉수를 베어내고 사다리를 올랐다.' }),
        () => commit({ phase: 3, hp: 6, san: 3, title: '촉수 절단 실패', body: '촉수의 타격을 허용하며 간신히 기어올랐다. HP -6, SAN -3.' }));
    } else if (approach === 'NONE') {
      commit({ phase: 3, hp: 7, san: 4, title: '맨몸으로 사다리 돌파', body: '촉수를 떼어내며 사다리를 올랐다. HP -7, SAN -4.' });
    }
  };
  const handleVentEscape = (approach) => {
    if (!ready(3) || !['COMBO', 'STR'].includes(approach)) return;
    const state = getState();
    const crowbar = hasItem(state, 'crowbar');
    const striker = hasItem(state, 'wrench', 'tumbler', 'extinguisher');
    const escape = () => {
      setTurnLimit((turns) => Math.max(0, turns - 1));
      triggerScreenEffect('surface-light', 1100);
      finishGame(context, getEscapeEnding(getState().player));
    };
    if (approach === 'COMBO') {
      if (!crowbar || !striker) return;
      addLog('빠루 + 타격도구 지렛대 연계: 맨홀 확정 개방.');
      escape();
    } else {
      openDiceCheck('주철 맨홀 뚜껑 최종 개방', 'STR', crowbar ? 9 : 14, escape,
        () => commit({ phase: 3, hp: 3, title: '맨홀 개방 실패', body: '녹슨 뚜껑이 꿈쩍하지 않는다. 어깨에 통증이 번진다. HP -3.' }));
    }
  };
  return { handleStage5Action, handleVentDefense, handleVentEscape, handlePushManhole: () => handleVentEscape('STR') };
}
