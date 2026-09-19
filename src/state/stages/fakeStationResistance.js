import { SCENE_ASSETS } from '../../data/assetDB.js';
import { ITEM_DATABASE as I } from '../../data/itemDB.js';
import { applyDamage, canAct, finishGame, hasItem } from '../gameRules.js';
import { getFakeStationAction } from '../../data/fakeStationActions.js';

export function createFakeStationResistanceHandler(context, enter) {
  const {
    getState,
    setPlayer,
    setFlags,
    setActiveModalText,
    openDiceCheck,
    addLog,
  } = context;

  const showEquipment = (item, kind, body, onClose, extra = {}) =>
    setActiveModalText({
      title: `${kind} · ${item.name}`,
      tag: kind,
      illustration: item,
      body,
      onClose,
      ...extra,
    });

  const finishResistance = (action, success) => {
    const state = getState();

    if (!success) {
      const hpCost = action.phase === 1 ? 4 : 5;
      const sanCost = action.phase === 1 ? 2 : 3;
      const injured = applyDamage(state.player, hpCost, sanCost);

      setPlayer(() => injured);

      setFlags((flags) => ({
        ...flags,
        fakeStationResistance: false,
        fakeStationPhase: 0,
        fakeStationFailed: true,
      }));

      addLog(
        `가짜역 탈출 시도 실패 · HP -${state.player.hp - injured.hp}, SAN -${state.player.san - injured.san}`
      );

      const modifiers = [
        {
          label: 'HP',
          from: `HP ${state.player.hp}`,
          to: `HP ${injured.hp}`,
          tone: 'damage',
        },
      ];

      if (injured.san !== state.player.san) {
        modifiers.push({
          label: 'SAN',
          from: `SAN ${state.player.san}`,
          to: `SAN ${injured.san}`,
          tone: 'damage',
        });
      }

      setActiveModalText({
        title: '탈출 실패',
        tag: action.outcomeTag ?? '저항 실패',
        image: SCENE_ASSETS.TRAP_EXIT,
        ...(action.item ? { illustration: action.item } : {}),

        body:
          `${action.failureText ?? '힘이 빠졌다. 수축하는 점막이 다시 몸을 조여 온다.'}` +
          `\n\n몸이 안쪽으로 끌려간다.` +
          `\nHP -${state.player.hp - injured.hp}, SAN -${state.player.san - injured.san}.`,

        modifiers,

        onClose: () => finishGame(context, 'BAD_2'),
      });

      return;
    }

    if (action.phase === 1) {
      setFlags((flags) => ({
        ...flags,
        fakeStationPhase: 2,
        fakeStationEscapeBonus: 0,
      }));

      addLog('가짜역 탈출 1단계 성공 · 빠져나갈 틈 확보');

      setActiveModalText({
        title: '점막의 움직임이 멈췄다',
        tag: action.outcomeTag ?? '탈출 기회 확보',
        image: SCENE_ASSETS.TRAP_EXIT,
        ...(action.item ? { illustration: action.item } : {}),

        body:
          `${action.successText}` +
          `\n\n점막이 느슨해진 건 잠깐뿐이다.` +
          `\n지금 틈을 벌려 빠져나가야 한다.`,

        onClose: () => {},
      });

      return;
    }

    const survivor = applyDamage(state.player, 3, 2);

    setPlayer(() => survivor);

    if (survivor.hp <= 0 || survivor.san <= 0) {
      setFlags((flags) => ({
        ...flags,
        fakeStationResistance: false,
        fakeStationPhase: 0,
        fakeStationFailed: true,
      }));

      finishGame(context, 'BAD_2');
      return;
    }

    setFlags((flags) => ({
      ...flags,
      fakeStationSurvived: true,
    }));

    addLog(
      `가짜역 탈출 성공 · HP -${state.player.hp - survivor.hp}, SAN -${state.player.san - survivor.san}`
    );

    const modifiers = [
      {
        label: 'HP',
        from: `HP ${state.player.hp}`,
        to: `HP ${survivor.hp}`,
        tone: 'damage',
      },
    ];

    if (survivor.san !== state.player.san) {
      modifiers.push({
        label: 'SAN',
        from: `SAN ${state.player.san}`,
        to: `SAN ${survivor.san}`,
        tone: 'damage',
      });
    }

    setActiveModalText({
      title: '환승 통로로 탈출했다',
      tag: action.outcomeTag ?? '탈출 성공',
      image: SCENE_ASSETS.TRAP_EXIT,
      ...(action.item ? { illustration: action.item } : {}),

      body:
        `${action.successText}` +
        `\n\n몸을 비틀어 점막 사이로 빠져나왔다.` +
        `\n계단을 기어올라 환승 통로로 달렸다.` +
        `\n뒤에서는 젖은 벽이 다시 닫히는 소리가 들린다.` +
        `\n\nHP -${state.player.hp - survivor.hp}, SAN -${state.player.san - survivor.san}.`,

      modifiers,

      onClose: () => {
        setFlags((flags) => ({
          ...flags,
          fakeStationResistance: false,
          fakeStationPhase: 0,
          fakeStationEscapeBonus: 0,
        }));

        enter('STAGE_4_MALL');
      },
    });
  };

  const handleFakeStationResistance = (actionId) => {
    const state = getState();
    const phase = state.flags.fakeStationPhase;

    if (
      state.stage !== 'STAGE_3_PLATFORM' ||
      !state.flags.fakeStationResistance ||
      ![1, 2].includes(phase) ||
      !canAct(state)
    ) {
      return;
    }

    const action = getFakeStationAction(
      actionId,
      phase,
      state.player.inventory,
      state.flags.fakeStationEscapeBonus ?? 0,
      state.flags
    );

    if (!action) return;

    if (action.consumeOnAttempt) {
      setPlayer((player) => ({
        ...player,
        inventory: player.inventory.filter(
          (item) => item.id !== action.itemId
        ),
      }));
    } else if (action.emptyOnAttempt) {
      setPlayer((player) => ({
        ...player,
        inventory: player.inventory.map((item) =>
          item.id === action.itemId
            ? { ...item, empty: true }
            : item
        ),
      }));
    }

    const advanceAutomatically = () => {
      setFlags((flags) => ({
        ...flags,
        fakeStationPhase: 2,
        fakeStationEscapeBonus: action.autoBonus,
      }));

      addLog(
        `가짜역 탈출 도구 사용 · 다음 판정 DC -${action.autoBonus}`
      );

      setActiveModalText({
        title: '빠져나갈 틈이 생겼다',
        tag:
          action.outcomeTag ??
          (action.emptyOnAttempt ? '도구 사용' : '장비 효과'),

        image: SCENE_ASSETS.TRAP_EXIT,

        ...(action.item
          ? { illustration: action.item }
          : {}),

        body:
          `${action.successText}` +
          `\n\n점막이 벌어진 건 잠깐뿐이다.` +
          `\n지금 빠져나갈 방법을 골라야 한다.`,

        modifiers: [
          {
            label: '다음 판정 난이도',
            from: '기본 DC',
            to: `DC -${action.autoBonus}`,
            tone: 'benefit',
          },
        ],

        onClose: () => {},
      });
    };

    const applyAcidContact = (onResolved) => {
      if (!action.acidContact) {
        onResolved();
        return;
      }

      if (hasItem(getState(), 'rubber_gloves')) {
        setActiveModalText({
          title: '산성액이 튀었다',
          body:
            '산성액이 손등을 향해 튀었다. 하지만 절연 고무장갑이 맨살을 보호했다.',

          onClose: () =>
            showEquipment(
              I.RUBBER_GLOVES,
              '장비 효과',
              '두꺼운 고무층이 산성액을 막아냈다. 피부에는 닿지 않았다.',
              onResolved,
              {
                modifiers: [
                  {
                    label: '산성액 피해',
                    from: 'HP -2',
                    to: 'HP 0',
                    tone: 'benefit',
                  },
                ],
              }
            ),
        });

        return;
      }

      const current = getState();
      const injured = applyDamage(current.player, 2, 0);

      setPlayer(() => injured);

      addLog(
        `산성액 접촉 · HP -${current.player.hp - injured.hp}`
      );

      if (injured.hp <= 0) {
        finishGame(context, 'BAD_2');
        return;
      }

      setActiveModalText({
        title: '산성액에 손등이 닿았다',
        tag: '접촉 피해',
        illustration: I.ACID_VIAL,

        body:
          `튀어 오른 산성액이 손등을 태웠다.` +
          `\nHP -${current.player.hp - injured.hp}.`,

        modifiers: [
          {
            label: 'HP',
            from: `HP ${current.player.hp}`,
            to: `HP ${injured.hp}`,
            tone: 'damage',
          },
        ],

        onClose: onResolved,
      });
    };

    const roll = () =>
      openDiceCheck(
        action.label,
        action.stat,
        action.dc,
        () => finishResistance(action, true),
        () => finishResistance(action, false)
      );

    if (!action.item) {
      roll();
      return;
    }

    const afterUseModal = () => {
      if (action.autoBonus) {
        advanceAutomatically();
        return;
      }

      applyAcidContact(roll);
    };

    showEquipment(
      action.item,
      '장비 사용',
      action.useText,
      afterUseModal,
      {
        ...(action.modifiers.length
          ? { modifiers: action.modifiers }
          : {}),
      }
    );
  };

  return handleFakeStationResistance;
}