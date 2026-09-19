export const FATIGUE_ROLL_TABLE = (roll) => {
  if (roll === 1) {
    return {
      title: '3일 연속 철야 (Natural 1)',
      hp: 16,
      san: 12,
      trait: '카페인 중독 (DEX -1)',
      desc: '머리가 깨질 듯 아프고 손끝이 미세하게 떨린다. 정밀한 작업에는 불리한 상태다.',
    };
  }

  if (roll <= 7) {
    return {
      title: '수면 부족 / 극심한 피로',
      hp: 18,
      san: 14,
      trait: '피로 누적',
      desc: '온몸이 무겁다. 겨우 막차 좌석에 몸을 기대고 눈을 감았다.',
    };
  }

  if (roll <= 14) {
    return {
      title: '평범한 야근',
      hp: 20,
      san: 15,
      trait: '표준 컨디션',
      desc: '늘 겪던 지루한 야근이었다. 피곤하긴 하지만 아직 몸과 정신은 멀쩡하다.',
    };
  }

  if (roll <= 19) {
    return {
      title: '내일 연차 승인 완료!',
      hp: 22,
      san: 15,
      trait: '가벼운 발걸음 (회피/도주 DC -2)',
      desc: '퇴근 직전, 내일 연차가 최종 승인됐다. 피곤한데도 이상하게 발걸음이 가볍다.',
    };
  }

  return {
    title: '사직서 품에 품음 (Natural 20)',
    hp: 20,
    san: 15,
    trait: '잃을 게 없음 (공포 저항 자동 성공)',
    desc: '코트 안주머니에는 사직서 봉투가 들어 있다. 오늘만 버티면 끝이다. 이제 웬만한 일에는 겁먹을 이유도 없다.',
  };
};