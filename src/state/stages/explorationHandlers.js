import { EXPLORATION_STAGES } from '../../data/explorationDB.js';
import { SCENE_ASSETS } from '../../data/assetDB.js';
import { ITEM_DATABASE as I } from '../../data/itemDB.js';
import { SCENARIO_TEXT } from '../../data/scenarioDB.js';
import { applyDamage, canAct, checkCollapse, finishGame, grantItems, hasItem } from '../gameRules.js';

export function createExplorationHandlers(context, stage) {
  const { setPlayer, setAp, setExaminedPoints, setFlags, setActiveModalText, setStage, setTurnLimit, setVentPhase, sfx, addLog, openDiceCheck, getState } = context;
  const enter = (nextStage) => {
    sfx.playStageTransition();
    setStage(nextStage); setAp(3); setExaminedPoints([]);
    if (nextStage === 'STAGE_5_VENT') { setTurnLimit(3); setVentPhase(1); }
    addLog(`다음 구역 진입: ${nextStage === 'STAGE_5_VENT' ? '수직 환기탑 · 3단계 결전' : EXPLORATION_STAGES[nextStage].title}`);
  };
  const showEquipment = (item, kind, body, onClose, extra = {}) => setActiveModalText({
    title: kind + ' · ' + item.name, tag: kind, illustration: item, body, onClose, ...extra,
  });
  const afterExplore = (stateOverride = null) => {
    const state = stateOverride ?? getState();
    const checkContext = stateOverride ? { ...context, getState: () => state } : context;
    if (checkCollapse(checkContext)) return;
    if (state.ap > 0) return;
    if (stage === 'STAGE_1_CAR6') {
      context.triggerGlitch(500);
      context.triggerScreenEffect?.('impact', 560);
      setActiveModalText({ title: '7호차 격벽 붕괴', body: '승객의 허물을 뒤집어쓴 거대한 지네가 문틈을 뚫고 들어온다. 지금 탈출해야 한다.', image: SCENE_ASSETS.MIMIC,
        onClose: () => {
          if (!hasItem(getState(), 'wrench')) { finishGame(context, 'BAD_1'); return; }
          showEquipment(I.WRENCH, '장비 재사용', '쇼핑백에서 꺼낸 비상 스패너를 다시 쥐었다. 묵직한 금속의 무게가 손에 익었다.',
            () => setActiveModalText({ title: SCENARIO_TEXT.text_27, body: SCENARIO_TEXT.text_28, onClose: () => enter('STAGE_2_TUNNEL') }));
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
      const protectedShock = !success && point.electrical && gloves;
      const protectedAcid = success && point.acidContact && gloves;
      const hpCost = success ? (point.acidContact && !gloves ? 2 : 0) : (point.electrical && gloves ? 2 : point.failHp ?? 0);
      const sanCost = success ? point.sanCost ?? 0 : point.failSan ?? 0;
      if (success && point.rewards?.length) sfx.playAction();
      if (protectedShock) {
        addLog(point.title + ': 판정 실패 · 절연 고무장갑으로 감전 피해 감소');
        setActiveModalText({ title: point.title, body: '젖은 타일에 발을 헛디뎌 고압선에 스쳤다. 푸른 전류가 팔을 타고 올라왔다.', image: point.image,
          onClose: () => {
            showEquipment(I.RUBBER_GLOVES, '장비 효과', '강한 전류가 팔을 타고 올라왔다. 두꺼운 고무층이 충격을 줄여 손끝의 마비가 빠르게 약해졌다.',
              () => {
                const current = getState();
                const injuredPlayer = applyDamage(current.player, hpCost, sanCost);
                setPlayer((player) => applyDamage(player, hpCost, sanCost));
                afterExplore({ ...current, player: injuredPlayer });
              }, {
                modifiers: [{ label: '감전 피해', from: 'HP -6', to: 'HP -' + hpCost, tone: 'damage' }],
              });
          } });
        return;
      }
      const rewards = (point.rewards ?? []).filter((item) => item.id !== I.POWERBANK.id);
      setPlayer((player) => {
        const updated = applyDamage(player, hpCost, sanCost);
        const granted = success ? grantItems(updated, rewards) : updated;
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
      if (success && hpCost) body += '\n보호 장갑 없이 채취하다 산성액에 닿았다. HP -' + hpCost + '.';
      if (sanCost && latest.player.trait.includes('잃을 게 없음')) body += '\n공포 저항으로 SAN 감소가 면제되었다.';
      addLog(point.title + ': ' + (success ? '조사 완료' : '판정 실패') + ' · AP ' + (state.ap - 1) + '/3');
      const onClose = protectedAcid ? () => {
        setActiveModalText({ title: '산성액 접촉 위험', body: '채취병에 점액을 옮기는 순간, 유리 틈에서 산성액 한 방울이 튀었다.',
          onClose: () => showEquipment(I.RUBBER_GLOVES, '장비 효과', '산성액이 장갑 손등에 닿았다. 두꺼운 고무층이 맨살에 닿기 전에 액체를 막아 냈다.',
            afterExplore, { modifiers: [{ label: '산성액 접촉 피해', from: 'HP -2', to: 'HP 0', tone: 'damage' }] }) });
      } : afterExplore;
      if (success && point.immediateItem) {
        const batterySpent = hasItem(state, 'lantern') ? 0 : stage === 'STAGE_1_CAR6' ? 3 : 5;
        const batteryFrom = Math.max(0, state.player.battery - batterySpent);
        const batteryTo = Math.min(100, batteryFrom + (point.batteryGain ?? 0));
        const itemIllustrations = [
          { ...point.immediateItem, caption: `즉시 사용 · ${point.immediateItem.name}` },
          ...(point.rewards ?? []).map((item) => ({ ...item, caption: `획득 · ${item.name}` })),
        ];
        setActiveModalText({
          title: '즉시 사용 · ' + point.immediateItem.name,
          tag: '충전 완료 · 도구 획득',
          illustrations: itemIllustrations,
          rewardItems: [],
          body: point.body,
          onClose,
          modifiers: [{ label: '스마트폰 배터리', from: batteryFrom + '%', to: batteryTo + '%', tone: 'benefit' }],
        });
        return;
      }
      setActiveModalText({ title: point.title, body, image: point.image, tag: success && point.rewards?.length ? '도구 획득' : point.tag, onClose });
    };
    if (point.check && !(point.cardBypass && hasItem(state, 'key_card'))) openDiceCheck(point.title, ...point.check, () => resolve(true), () => resolve(false));
    else resolve(true);
  };
  const choosePlatformExit = (choice) => {
    const state = getState();
    if (stage !== 'STAGE_3_PLATFORM' || state.stage !== stage || state.ap > 0 || !canAct(state) || !['EXIT_3', 'BREAKER'].includes(choice)) return;
    if (choice === 'EXIT_3' && !state.flags.clueFakeStation) {
      setFlags((flags) => ({ ...flags, fakeStationResistance: true, fakeStationPhase: 1, fakeStationEscapeBonus: 0 }));
      setActiveModalText({ title: '계단을 오르려는 순간', tag: '위험 감지', body: '발을 내딛는 순간, 벽이 먼저 움직였다.\n\n타일처럼 보였던 표면이 젖은 살갗처럼 꿈틀거렸다. 출구라고 생각했던 통로가 안쪽으로 접히며 닫혔다.\n\n그제야 알아차렸다.\n\n나는 출구로 향한 게 아니었다. 이미 무언가의 입 안으로 걸어 들어와 있었다.', image: SCENE_ASSETS.TRAP_EXIT, onClose: () => setActiveModalText({ title: '최후의 반항', tag: '아직 끝나지 않았다', body: '통로가 목구멍처럼 좁아들었다. 몸이 안쪽으로 끌려가기 시작했다.\n\n아직 손은 움직였다. 가방 안에서 지금 쓸 수 있는 물건을 찾았다.', image: SCENE_ASSETS.TRAP_EXIT, onClose: () => {} }) });
    } else if (choice === 'EXIT_3') {
      setActiveModalText({ title: SCENARIO_TEXT.text_77, body: SCENARIO_TEXT.text_78, onClose: () => enter('STAGE_4_MALL') });
    } else enter('STAGE_4_MALL');
  };
  return { examine, choosePlatformExit, enter };
}
