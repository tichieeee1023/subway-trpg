import { SCENARIO_TEXT } from './scenarioDB.js';

export const ENDING_DEFINITIONS = {
  BAD_1: { id: 'BAD_1', type: 'BAD', cardId: 'BAD_1', title: SCENARIO_TEXT.text_25, desc: SCENARIO_TEXT.text_26 },
  BAD_2: { id: 'BAD_2', type: 'BAD', cardId: 'BAD_2', title: SCENARIO_TEXT.text_75, desc: SCENARIO_TEXT.text_76 },
  BAD_3: { id: 'BAD_3', type: 'BAD', cardId: 'BAD_3', title: SCENARIO_TEXT.text_129, desc: SCENARIO_TEXT.text_130 },
  NORMAL: { id: 'NORMAL', type: 'NORMAL', cardId: 'NORMAL', title: SCENARIO_TEXT.text_124, desc: SCENARIO_TEXT.text_125 },
  GOOD: { id: 'GOOD', type: 'GOOD', cardId: 'GOOD', title: 'GOOD END : 새벽의 생존 보고서', desc: '상처투성이의 몸으로 도로변에 주저앉았다. 쏟아지는 사이렌 소리와 함께 119 대원이 은박 보온 담요를 둘러준다.\n\n손에 쥔 스패너와 도구들만이 지하의 진실을 증명하고 있다. 떨리는 손으로 생존 보고서를 썼다. 그곳에서 있었던 일을, 누군가는 기억해야 한다.' },
  TRUE: { id: 'TRUE', type: 'TRUE', cardId: 'TRUE', title: SCENARIO_TEXT.text_122, desc: SCENARIO_TEXT.text_123 },
};

export const SECRET_STORY = {
  title: '04:44 AM — 폐쇄회로 밖의 기록',
  subtitle: '수도권 광역철도 비상대책본부 · 기밀 해제',
  content: '6호선 막차의 통신 두절은 단순 정전이 아니었다.\n\n역사 환기탑 심도 45미터에서 발견된 유기물 점막은 인간의 배양 세포가 거대화된 의태성 유기 복합체로 판명되었다. 이 개체는 실험실에서 유출된 뒤 폐쇄된 지하 수로를 따라 이동했고, 잔류 승객의 공포와 스트레스를 먹으며 역사 구조물 전체를 거대한 소화관으로 바꾸고 있었다.\n\n00:37 AM의 정전은 사고가 아니라 격리 작전이었다. 관제실은 이미 여러 차례 비정상 전력 소모와 승객 실종 신고를 받았지만, 막차가 역사 안으로 들어선 뒤에야 모든 출입문과 통신 회선을 차단했다. 구조 신호로 들리던 안내방송은 생존자를 찾기 위한 방송이 아니라, 개체의 반응을 기록하기 위한 자동 음성이었다.\n\n당신이 들고 나온 산성액에 녹아내린 비상 스패너, 의태체 체액 바이알, 그리고 진술서는 작전 실패를 증명하는 유일한 물증이 되었다. 그날 밤 지하에서 살아 나온 사람은 공식 기록상 존재하지 않는다. 다음 날 첫차 운행은 평소처럼 재개되었고, 6호차의 빈 좌석과 닫힌 문은 정비 불량으로 처리되었다.\n\n그러나 보고서 마지막 장에는 폐기 지시와 다른 필체의 메모가 덧붙어 있다.\n\n“지하철 계통의 개체는 소각 완료. 본체는 확인되지 않음. 한강 하류 수질 관측망에서 동일한 점액 성분이 검출되었고, 인근 대형 수조 시설의 순환 펌프가 새벽마다 37초씩 멈춘다. 관련 기관에는 아직 통보하지 말 것.”\n\n종이 모서리에는 해양 생물 전시관의 단체 관람 전단지 한 장이 클립으로 고정되어 있다. 날짜는 다음 주 토요일.\n\n04:44:12 AM. 폐쇄회로 밖에서도, 침식은 끝나지 않았다.',
};

export function getEscapeEnding(player) {
  if (player.hp <= 0 || player.san <= 0) return 'BAD_3';
  if (player.hp >= 12 && player.san >= 8) return 'TRUE';
  // NORMAL is the scarred-survivor ending.  The old 8 / 5 gate only left it
  // to players who were one hit from collapse, making this ending much harder
  // to encounter than either positive ending.
  if (player.hp >= 10 && player.san >= 7) return 'GOOD';
  return 'NORMAL';
}
