import { ITEM_DATABASE as I, ITEM_DB } from './itemDB.js';

const fakeStationActions = [
  {
    id: 'GLASSES', phase: 1, itemId: 'glasses', item: ITEM_DB.glasses, stat: 'INT', dc: 13, itemDcBonus: 3,
    label: '안경으로 점막의 수축하는 벽을 자세히 살핀다',
    useText: '안경을 고쳐 썼다. 흐릿하던 점막의 수축이 한 박자 늦어지는 순간이 보였다.',
    successText: '늦어진 수축을 읽고 몸을 비틀었다. 닫히던 통로가 잠시 벌어졌다.',
  },
  {
    id: 'LANTERN', phase: 1, itemId: 'lantern', item: I.LANTERN, autoBonus: 2,
    label: '랜턴으로 수축하는 점막을 비추어 확인한다',
    useText: '랜턴을 켜 점막을 비췄다. 밝은 빛 아래 수축하는 방향이 또렷해졌다.',
    successText: '빛을 따라 몸을 웅크렸다. 점막이 한순간 느슨해졌다.',
  },
  {
    id: 'EXTINGUISHER', phase: 1, itemId: 'extinguisher', item: I.EXTINGUISHER, emptyOnAttempt: true, autoBonus: 4,
    label: '소화기를 뿌려 점막을 움츠리게 한다',
    useText: '안전핀을 뽑고 소화기를 안쪽으로 분사했다. 흰 분말이 점막을 뒤덮었다.',
    successText: '분말에 놀란 점막이 오그라들었다. 소화기 내용물은 모두 비었다.',
  },
  {
    id: 'CUTTER', phase: 1, itemId: 'cutter', item: I.CUTTER, stat: 'DEX', dc: 13, consumeOnAttempt: true,
    label: '커터칼로 점막을 가른다',
    useText: '커터칼을 꺼내 점막이 접히는 틈으로 밀어 넣었다.',
    successText: '점막에 틈을 냈다. 몸을 밀어 넣는 순간 칼날이 휘어 부러졌다.', outcomeTag: '장비 파손',
  },
  {
    id: 'METAL_PEN', phase: 1, itemId: 'metal_pen', item: ITEM_DB.metal_pen, stat: 'DEX', dc: 16, consumeOnAttempt: true,
    label: '금속 만년필 촉을 점막에 찔러 넣는다',
    useText: '금속 만년필을 움켜쥐고 촉을 점막의 접힌 틈에 겨눴다.',
    successText: '점막에 작은 틈이 생겼다. 만년필 촉은 안쪽에서 납작하게 뭉개졌다.', outcomeTag: '장비 파손',
  },
  {
    id: 'ACID_VIAL', phase: 1, itemId: 'acid_vial', item: I.ACID_VIAL, stat: 'DEX', dc: 14, clueBonus: 'knows_dissolution',
    consumeOnAttempt: true, acidContact: true,
    label: '산성액을 점막의 약한 틈에 붓는다',
    useText: '산성액 채취병을 열어 점막의 접힌 틈으로 흘려 넣었다.',
    successText: '산성액이 닿자 점막이 지글거리며 풀어졌다. 채취병은 비었다.', outcomeTag: '장비 소모',
  },
  {
    id: 'LAPTOP_BAG', phase: 1, itemId: 'laptop_bag', item: ITEM_DB.laptop_bag, stat: 'STR', dc: 16, consumeOnAttempt: true,
    label: '노트북 가방을 끼워 입이 닫히지 않게 한다',
    useText: '노트북 가방을 접힌 입 안에 밀어 넣었다. 틈이 닫히기 전에 어깨를 밀어 넣었다.',
    successText: '입이 벌어진 사이 몸을 앞으로 밀었다. 가방 안감과 끈이 찢겨 더는 쓸 수 없었다.', outcomeTag: '장비 파손',
  },
  {
    id: 'HANDS_STR_1', phase: 1, stat: 'STR', dc: 24,
    label: '수축하는 벽을 양손으로 밀어낸다',
    useText: null,
    successText: '수축하는 벽을 양손으로 밀어냈다. 손바닥이 찢겼지만 잠깐 틈을 만들었다.',
  },
  {
    id: 'HANDS_DEX_1', phase: 1, stat: 'DEX', dc: 23,
    label: '수축하는 순간에 맞춰 몸을 비튼다',
    useText: null,
    successText: '수축이 멎는 순간 몸을 비틀었다. 어깨가 점막을 긁고 틈 사이로 빠져나왔다.',
  },
  {
    id: 'CROWBAR', phase: 2, itemId: 'crowbar', item: I.CROWBAR, stat: 'STR', dc: 14,
    label: '쇠지렛대를 이 사이에 걸고 벌린다',
    useText: '쇠지렛대의 납작한 끝을 이 사이에 걸고 체중을 실었다.',
    successText: '금속이 비명을 질렀다. 벌어진 틈으로 몸을 밀어 올렸다.',
  },
  {
    id: 'WRENCH', phase: 2, itemId: 'wrench', item: I.WRENCH, stat: 'STR', dc: 17,
    label: '비상 스패너를 걸어 틈을 벌린다',
    useText: '손에 익은 비상 스패너를 이 사이에 걸고 양손으로 비틀었다.',
    successText: '금속이 걸리는 순간 힘껏 몸을 끌어 올렸다. 좁은 틈이 벌어졌다.',
  },
  {
    id: 'TUMBLER', phase: 2, itemId: 'tumbler', item: ITEM_DB.tumbler, stat: 'STR', dc: 17, itemDcBonus: 4,
    consumeOnAttempt: true,
    label: '보냉 텀블러를 쐐기로 밀어 넣는다',
    useText: '보냉 텀블러를 이 사이에 끼워 넣고, 남은 틈으로 몸을 밀었다.',
    successText: '금속 몸체가 납작하게 찌그러지며 수축을 멈췄다. 텀블러는 더는 쓸 수 없었다.', outcomeTag: '장비 파손',
  },
  {
    id: 'LANYARD', phase: 2, itemId: 'lanyard', item: ITEM_DB.id_wire, stat: 'DEX', dc: 16, consumeOnAttempt: true,
    label: '사원증 릴홀더 와이어를 걸어 몸을 당긴다',
    useText: '사원증 릴홀더의 가는 와이어를 안쪽 돌기에 걸고 몸을 당겼다.',
    successText: '와이어가 팽팽해졌다. 몸은 빠져나왔지만 릴홀더는 끊어져 안쪽에 남았다.', outcomeTag: '장비 파손',
  },
  {
    id: 'RUNNING_SHOES', phase: 2, itemId: 'running_shoes', item: ITEM_DB.running_shoes, stat: 'DEX', dc: 18, itemDcBonus: 4,
    label: '쿠션 러닝화로 수축하는 틈을 박차고 뛴다',
    useText: '발을 웅크렸다. 쿠션이 남은 힘을 받아낼 수 있도록 발끝을 틈에 맞췄다.',
    successText: '수축이 느슨해지는 순간 바닥을 박찼다. 러닝화가 충격을 받아냈다.',
  },
  {
    id: 'LOTTO', phase: 2, itemId: 'lotto', item: I.LOTTO, stat: 'LUK', dc: 18, itemDcBonus: 2, consumeOnAttempt: true,
    label: '복권을 쥐고 남은 운을 건다',
    useText: '스피또 복권을 구겨 쥐었다. 종잇장이 손안에서 바스러졌다.',
    successText: '우연히 열린 틈에 몸을 던졌다. 복권은 젖은 점막에 달라붙어 사라졌다.', outcomeTag: '장비 소모',
  },
  {
    id: 'LUCKY_COIN', phase: 2, itemId: 'lucky_coin', item: ITEM_DB.lucky_coin, stat: 'STR', dc: 17, itemDcBonus: 3, consumeOnAttempt: true,
    label: '행운의 동전을 이 사이에 끼운다',
    useText: '행운의 100원 동전을 이 사이에 끼우고, 벌어진 틈을 붙잡았다.',
    successText: '동전이 박힌 틈으로 몸을 빼냈다. 동전은 안쪽에 남았다.', outcomeTag: '장비 소모',
  },
  {
    id: 'HANDS_STR_2', phase: 2, stat: 'STR', dc: 24,
    label: '맨손으로 수축하는 벽을 밀어낸다',
    useText: null,
    successText: '맨손으로 벽을 밀어냈다. 찢긴 손바닥을 틈에 걸고 몸을 끌어 올렸다.',
  },
  {
    id: 'HANDS_DEX_2', phase: 2, stat: 'DEX', dc: 23,
    label: '수축하는 박자에 맞춰 몸을 굴린다',
    useText: null,
    successText: '수축하는 박자에 몸을 굴렸다. 어깨를 접어 좁은 틈 밖으로 빠져나왔다.',
  },
];

export function getFakeStationActions(phase, inventory, escapeBonus = 0, flags = {}) {
  return fakeStationActions
    .filter((action) => action.phase === phase && (!action.itemId || inventory.some((item) => item.id === action.itemId
      && !(action.id === 'EXTINGUISHER' && item.empty))))
    .map((action) => {
      const clueBonus = action.clueBonus && flags[action.clueBonus] ? 2 : 0;
      const dcBonus = action.itemDcBonus ?? 0;
      const phaseBonus = phase === 2 ? escapeBonus : 0;
      const dc = action.stat ? Math.max(5, action.dc - dcBonus - phaseBonus - clueBonus) : null;
      const hint = action.autoBonus
        ? `확정 · 후속 판정 DC -${action.autoBonus}`
        : `${action.stat} DC ${dc} · D20`;
      const modifiers = dc !== null && dc < action.dc
        ? [{ label: '판정 난이도', from: `DC ${action.dc}`, to: `DC ${dc}`, tone: 'benefit' }]
        : [];
      return { ...action, dc, hint, modifiers };
    });
}

export function getFakeStationAction(id, phase, inventory, escapeBonus = 0, flags = {}) {
  return getFakeStationActions(phase, inventory, escapeBonus, flags).find((action) => action.id === id);
}
