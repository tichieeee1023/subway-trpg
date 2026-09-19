import { SCENARIO_TEXT } from './scenarioDB.js';

export const ENDING_DEFINITIONS = {
  BAD_1: {
    id: 'BAD_1',
    type: 'BAD',
    cardId: 'BAD_1',
    title: SCENARIO_TEXT.text_25,
    desc: SCENARIO_TEXT.text_26,
    hint: '7호차의 문이 무너질 때, 다시 붙잡을 도구가 곁에 있었다면…',
  },

  BAD_2: {
    id: 'BAD_2',
    type: 'BAD',
    cardId: 'BAD_2',
    title: SCENARIO_TEXT.text_75,
    desc: SCENARIO_TEXT.text_76,
    hint: '가짜 역의 방송을 믿기 전에, 주변의 이상한 흔적을 살폈다면…',
  },

  BAD_3: {
    id: 'BAD_3',
    type: 'BAD',
    cardId: 'BAD_3',
    title: SCENARIO_TEXT.text_129,
    desc: SCENARIO_TEXT.text_130,
    hint: '마지막 구간에서 남은 체력과 정신력을 지켜냈다면…',
  },

  NORMAL: {
    id: 'NORMAL',
    type: 'NORMAL',
    cardId: 'NORMAL',
    title: SCENARIO_TEXT.text_124,
    desc: SCENARIO_TEXT.text_125,
    hint: '살아남았지만 상처가 깊었다. 더 많은 준비를 하고 탈출했다면…',
  },

  GOOD: {
    id: 'GOOD',
    type: 'GOOD',
    cardId: 'GOOD',
    hint: '핵심 장비를 챙겨 탈출 중 한두 번의 실수를 만회했다면…',
    title: 'GOOD END : 새벽의 생존 보고서',
    desc:
      '도로변에 주저앉자 멀리서 사이렌 소리가 가까워졌다.\n\n잠시 뒤 도착한 119 대원이 피투성이가 된 몸에 은박 보온 담요를 둘러주었다.\n\n손에는 아직 지하에서 챙겨 나온 도구와 증거가 남아 있다.\n누군가는 그곳에서 무슨 일이 있었는지 알아야 한다.\n\n떨리는 손으로 휴대폰 메모장을 열었다.\n그리고 기억나는 모든 것을 하나씩 적기 시작했다.',
  },

  TRUE: {
    id: 'TRUE',
    type: 'TRUE',
    cardId: 'TRUE',
    title: SCENARIO_TEXT.text_122,
    desc: SCENARIO_TEXT.text_123,
    hint: '토치와 빠루, 산소마스크를 지키고 모든 단계를 완벽히 넘었다면…',
  },
};

export const SECRET_STORY = {
  title: '04:44 AM — 폐쇄회로 밖의 기록',

  subtitle: '수도권 광역철도 비상대책본부 · 기밀 해제',

  content:
    '2호선 막차의 통신 두절은 단순한 정전 사고가 아니었다.\n\n' +

    '역사 환기탑 아래 약 45미터 지점에서 정체불명의 유기물 점막이 발견되었다.\n' +
    '조사 결과, 인간 세포와 유사한 조직이 비정상적으로 증식한 의태성 유기 복합체로 확인되었다.\n\n' +

    '개체는 폐쇄된 지하 수로를 따라 이동하며 역사 내부로 침투했다.\n' +
    '승객의 움직임과 소리에 반응했고, 시간이 지날수록 벽과 통로까지 유기 조직으로 바꾸기 시작했다.\n' +
    '사라진 승객들의 흔적 역시 개체 내부에서 발견되었다.\n\n' +

    '00:37 AM의 정전은 사고가 아니라 격리 조치였다.\n\n' +

    '관제실은 이전부터 비정상적인 전력 사용과 승객 실종 신고를 확인하고 있었다.\n' +
    '하지만 막차가 역사 안으로 진입한 뒤에야 모든 출입구와 일부 통신 회선이 차단되었다.\n\n' +

    '당신이 들었던 안내방송도 구조 방송이 아니었다.\n' +
    '격리 구역 내부의 상황과 개체의 반응을 확인하기 위해 반복 재생된 자동 음성이었다.\n\n' +

    '당신이 지상으로 가져온 산성 점액 샘플과 역무원의 흔적, 그리고 생존 진술서는 작전 실패를 증명하는 자료가 되었다.\n\n' +

    '하지만 공식 기록에는 그날 밤 지하에서 살아 나온 사람이 없다.\n' +
    '다음 날 첫차는 평소와 같이 운행되었다.\n' +
    '6호차의 이상 흔적도 단순한 차량 정비 문제로 처리되었다.\n\n' +

    '보고서 마지막 장에는 폐기 지시와 다른 필체의 메모가 남아 있다.\n\n' +

    '“지하철 구역의 개체는 소각 완료.\n' +
    '본체는 확인되지 않음.\n\n' +
    '한강 하류 수질 관측망에서 동일한 성분이 검출됨.\n' +
    '인근 대형 수조 시설의 순환 펌프가 매일 새벽 37초 동안 정지하는 현상 확인.\n\n' +
    '관련 기관에는 아직 통보하지 말 것.”\n\n' +

    '종이 모서리에는 해양 생물 전시관의 단체 관람 전단지가 한 장 끼워져 있다.\n' +
    '날짜는 다음 주 토요일이다.\n\n' +

    '04:44:12 AM.\n\n' +
    '폐쇄회로 밖에서도, 침식은 끝나지 않았다.',
};

export function getEscapeEnding(player) {
  if (player.hp <= 0 || player.san <= 0) return 'BAD_3';

  if (player.hp >= 12 && player.san >= 8) return 'TRUE';

  // GOOD: 비교적 안정적인 상태로 탈출
  if (player.hp >= 10 && player.san >= 7) return 'GOOD';

  // NORMAL: 살아남았지만 심각한 부상 또는 정신적 충격이 남은 상태
  return 'NORMAL';
}
