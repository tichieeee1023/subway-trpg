import { EXPLORATION_STAGES } from '../../data/explorationDB.js';
import { SCENE_ASSETS } from '../../data/assetDB.js';
import { SCENARIO_TEXT } from '../../data/scenarioDB.js';
import { applyDamage, canAct, checkCollapse, finishGame, grantItems, hasItem } from '../gameRules.js';

export function createExplorationHandlers(context, stage) {
  const { setPlayer, setAp, setExaminedPoints, setFlags, setActiveModalText, setStage, setTurnLimit, setVentPhase, sfx, addLog, openDiceCheck, getState } = context;
  const enter = (nextStage) => {
    setStage(nextStage); setAp(3); setExaminedPoints([]);
    if (nextStage === 'STAGE_5_VENT') { setTurnLimit(3); setVentPhase(1); }
    addLog(`다음 구역 진입: ${nextStage === 'STAGE_5_VENT' ? '수직 환기탑 · 3단계 결전' : EXPLORATION_STAGES[nextStage].title}`);
  };
  const afterExplore = () => {
    if (checkCollapse(context)) return;
    const state = getState();
    if (state.ap > 0) return;
    if (stage === 'STAGE_1_CAR6') {
      context.triggerGlitch(500);
      setActiveModalText({ title: '7호차 격벽 붕괴', body: '승객의 허물을 뒤집어쓴 거대한 지네가 문틈을 뚫고 들어온다. 지금 탈출해야 한다.', image: SCENE_ASSETS.MIMIC,
        onClose: () => {
          if (!hasItem(getState(), 'wrench')) { finishGame(context, 'BAD_1'); return; }
          setActiveModalText({ title: SCENARIO_TEXT.text_27, body: SCENARIO_TEXT.text_28, onClose: () => enter('STAGE_2_TUNNEL') });
        } });
    } else if (stage === 'STAGE_2_TUNNEL') {
      setActiveModalText({ title: SCENARIO_TEXT.text_54, body: SCENARIO_TEXT.text_55, onClose: () => enter('STAGE_3_PLATFORM') });
    } else if (stage === 'STAGE_4_MALL') {
      setActiveModalText({ title: SCENARIO_TEXT.text_98, body: hasItem(state, 'key_card') ? SCENARIO_TEXT.text_99 : '설비구역 안쪽의 수동 빗장을 열고 방화문을 통과했다. 등 뒤에서 촉수와 마네킹들이 쏟아져 들어온다. 문을 단단히 걸어 잠갔다.\n\n위쪽에서 차가운 밤비 냄새가 쏟아져 내린다. 마지막이다.', onClose: () => enter('STAGE_5_VENT') });
    }
  };
  const examine = (pointId) => {
    const state = getState();
    const point = EXPLORATION_STAGES[stage].points.find((entry) => entry.id === pointId);
    if (!point || state.stage !== stage || !canAct(state) || state.ap <= 0 || state.examinedPoints.includes(pointId)) return;
    sfx.playClick(); setAp(state.ap - 1); setExaminedPoints((previous) => [...previous, pointId]);
    setPlayer((player) => ({ ...player, battery: hasItem(state, 'lantern') ? player.battery : Math.max(0, player.battery - (stage === 'STAGE_1_CAR6' ? 3 : 5)) }));
    const resolve = (success) => {
      const latest = getState();
      const gloves = hasItem(latest, 'rubber_gloves');
      const hpCost = success ? (point.acidContact && !gloves ? 2 : 0) : (point.electrical && gloves ? 2 : point.failHp ?? 0);
      const sanCost = success ? point.sanCost ?? 0 : point.failSan ?? 0;
      setPlayer((player) => {
        const updated = applyDamage(player, hpCost, sanCost);
        const granted = success ? grantItems(updated, point.rewards ?? []) : updated;
        return { ...granted, battery: Math.min(100, granted.battery + (success ? point.batteryGain ?? 0 : 0)) };
      });
      if (success) setFlags((flags) => ({ ...flags, ...point.flags,
        anomalyCount: flags.anomalyCount + (point.anomaly ? 1 : 0),
        has_wrench: flags.has_wrench || point.rewards?.some((item) => item.id === 'wrench') || false,
        has_lantern: flags.has_lantern || point.rewards?.some((item) => item.id === 'lantern') || false,
        has_prybar: flags.has_prybar || point.rewards?.some((item) => item.id === 'crowbar') || false,
        has_master_card: flags.has_master_card || point.rewards?.some((item) => item.id === 'key_card') || false,
      }));
      let body = success ? point.body : point.failure ?? '수색에 실패했다. 시간을 소모했지만 도구를 확보하지 못했다.';
      if (success && hpCost) body += `\n보호 장갑 없이 채취하다 산성액에 닿았다. HP -${hpCost}.`;
      if (!success && point.electrical && gloves) body = '누전이 튀었지만 절연장갑이 충격을 줄여 주었다. HP -2.';
      if (sanCost && latest.player.trait.includes('잃을 게 없음')) body += '\n공포 저항으로 SAN 감소가 면제되었다.';
      addLog(`${point.title}: ${success ? '조사 완료' : '판정 실패'} · AP ${state.ap - 1}/3`);
      setActiveModalText({ title: point.title, body, image: point.image, tag: success && point.rewards?.length ? '도구 획득' : point.tag, onClose: afterExplore });
    };
    if (point.check && !(point.cardBypass && hasItem(state, 'key_card'))) openDiceCheck(point.title, ...point.check, () => resolve(true), () => resolve(false));
    else resolve(true);
  };
  const choosePlatformExit = (choice) => {
    const state = getState();
    if (stage !== 'STAGE_3_PLATFORM' || state.stage !== stage || state.ap > 0 || !canAct(state) || !['EXIT_3', 'BREAKER'].includes(choice)) return;
    if (choice === 'EXIT_3' && !state.flags.clueFakeStation) {
      setActiveModalText({ title: '가짜 3번 출구', body: '계단이 일렁이며 붉은 식도로 변했다. 역 전체가 입을 벌리고 있다.', image: SCENE_ASSETS.TRAP_EXIT, onClose: () => finishGame(context, 'BAD_2') });
    } else if (choice === 'EXIT_3') {
      setActiveModalText({ title: SCENARIO_TEXT.text_77, body: SCENARIO_TEXT.text_78, onClose: () => enter('STAGE_4_MALL') });
    } else enter('STAGE_4_MALL');
  };
  return { examine, choosePlatformExit };
}
