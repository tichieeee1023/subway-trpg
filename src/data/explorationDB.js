import { ITEM_DATABASE as I } from './itemDB.js';
import { SCENARIO_TEXT as T } from './scenarioDB.js';
import { SCENE_ASSETS as S } from './assetDB.js';

const compactTags = {
  p1_padding: '버려진 소지품 더미', p2_intercom: '끊긴 호출음', p3_valve: '문 옆의 숨은 레버', p4_shelf: '안쪽의 단단한 무게', p5_door: '유리 너머의 움직임', p6_floor: '지워지지 않는 얼룩',
  t1_recess: '벽 안쪽의 희미한 빛', t2_phone: '끊기지 않는 발신음', t3_cart: '기름 묻은 작업 흔적', t4_rail: '금속을 타고 흐르는 불빛', t5_pump: '바닥에서 새는 물소리', t6_extinguisher: '잠긴 점검함',
  m1_map: '지워진 역명 하나', m2_vending: '멈춘 자판기', m3_mirror: '한 박자 늦은 그림자', m4_office: '창구 아래 벗겨진 살결', m5_acid: '유리틈의 끈적한 막', m6_breaker: '문 너머의 낮은 진동',
  c1_store: '불 꺼진 계산대', c2_mannequin: '서로 다른 방향의 시선', c3_cctv: '재생 중인 감시 화면', c4_gate: '불규칙하게 깜빡이는 단말', c5_pharmacy: '셔터 아래 약품 냄새', c6_duct: '위쪽에서 들리는 팬 소리',
};
const point = (id, title, tag, body, options = {}) => ({ id, title, tag: compactTags[id] ?? tag, body, ...options });
export const EXPLORATION_STAGES = {
  STAGE_1_CAR6: { title: '암전된 6호차', color: 'cyan', points: [
    point('p1_padding', '① 바닥에 버려진 외투', '버려진 소지품 더미', T.text_2, { rewards: [I.CUTTER, I.POWERBANK], batteryGain: 20 }),
    point('p2_intercom', '② 벽면 비상 인터폰', '끊긴 호출음', T.text_5, { check: ['INT', 11], failSan: 2, failure: '하울링이 머릿속을 찢고 지나갔다. SAN -2.' }),
    point('p3_valve', '③ 출입문 옆의 수동 코크', '문 옆의 숨은 레버', T.text_11),
    point('p4_shelf', '④ 선반 위 눌린 쇼핑백', '안쪽의 단단한 무게', T.text_14, { rewards: [I.WRENCH] }),
    point('p5_door', '⑤ 7호차 쪽 유리창', '유리 너머의 움직임', T.text_17, { check: ['DEX', 12], sanCost: 2, failSan: 3, failure: '캔커피를 찼다. 유리창 반대편에 검은 안구가 부딪혔다. SAN -3.' }),
    point('p6_floor', '⑥ 바닥의 검붉은 얼룩', '지워지지 않는 얼룩', '스마트폰 라이트를 비추고 떨어진 철조각으로 찍어 보자, 쇠가 치이익 거품을 물며 녹아내렸다. 피가 아니다. 생체 분해 강산성 소화액이다.'),
  ] },
  STAGE_2_TUNNEL: { title: '선로 터널 300m', color: 'cyan', points: [
    point('t1_recess', '① 벽면 비상 대피 홈', '벽 안쪽의 희미한 빛', '보관함에서 고출력 안전 랜턴을 획득했다. 스마트폰 배터리 소모를 막고, 최종전에서 촉수를 시간을 잃지 않고 견제할 수 있다.', { check: ['INT', 11], rewards: [I.LANTERN], failHp: 3, failure: '그늘에 숨은 유충을 건드렸다. HP -3.' }),
    point('t2_phone', '② 주황색 비상 전화기', '끊기지 않는 발신음', T.text_37, { check: ['INT', 11], failSan: 2, flags: { knows_vent_shaft: true }, failure: '수화기에서 검은 진물과 귓속말이 쏟아졌다. SAN -2.' }),
    point('t3_cart', '③ 보수용 손수레 트로리', '기름 묻은 작업 흔적', T.text_43, { check: ['STR', 11], rewards: [I.CROWBAR], failure: T.text_46 }),
    point('t4_rail', '④ 750V 제3궤조 고압선', '금속을 타고 흐르는 불빛', T.text_49, { check: ['DEX', 12], failHp: 6, electrical: true, failure: '고압선에 스쳤다. 절연장갑이 없다면 HP -6.' }),
    point('t5_pump', '⑤ 집수정 배수 밸브', '바닥에서 새는 물소리', '펌프실의 흙탕물에서 공업용 절연 고무장갑을 건져냈다. 감전과 산성액 접촉을 막아 줄 것이다.', { rewards: [I.RUBBER_GLOVES], image: S.PUMP }),
    point('t6_extinguisher', '⑥ 선로 점검함', '잠긴 점검함', '점검함에 묶인 휴대용 분말 소화기를 떼어냈다. 분말로 촉수를 견제하고 무거운 통으로 맨홀을 타격할 수 있다.', { check: ['STR', 10], rewards: [I.EXTINGUISHER], failHp: 2, failure: '고정 걸쇠가 튕겨 손등을 긁었다. HP -2.' }),
  ] },
  STAGE_3_PLATFORM: { title: '신도림 환승역 플랫폼', color: 'emerald', points: [
    point('m1_map', '① 종합 노선도 역명판', '지워진 역명 하나', T.text_58, { check: ['INT', 11], rewards: [I.CLUE_MAP], anomaly: true, flags: { clueFakeStation: true }, failure: T.text_61 }),
    point('m2_vending', '② 승강장 캔 음료 자판기', '멈춘 자판기', '덜컹거리는 투입구에서 에너지 드링크를 꺼냈다. 차가운 캔이 손바닥에 닿는다.', { rewards: [I.ENERGY] }),
    point('m3_mirror', '③ 안전 전신 볼록 거울', '한 박자 늦은 그림자', T.text_67.replace('SAN -3', 'SAN -2'), { anomaly: true, sanCost: 2 }),
    point('m4_office', '④ 역무원 고객안내센터', '창구 아래 벗겨진 살결', T.text_70, { rewards: [I.CLUE_SKIN, I.KEY_BRASS], anomaly: true }),
    point('m5_acid', '⑤ 스크린도어 점막', '유리틈의 끈적한 막', '유리 틈의 산성 점액을 병에 담았다. 금속 베어링을 녹일 만큼 강한 체액이다.', { rewards: [I.ACID_VIAL], acidContact: true }),
    point('m6_breaker', '⑥ 배전실 점검문', '문 너머의 낮은 진동', T.text_73),
  ] },
  STAGE_4_MALL: { title: '지하 환승 상가', color: 'purple', points: [
    point('c1_store', '① 24시 편의점 안쪽', '불 꺼진 계산대', '등록기 안쪽에서 마스터 카드키와 에너지 드링크를 챙겼다. 카드키는 개찰구의 함정 날개를 안전하게 열어 준다.', { rewards: [I.KEY_CARD, I.ENERGY] }),
    point('c2_mannequin', '② 쇼윈도 마네킹 무리', '서로 다른 방향의 시선', T.text_84, { check: ['DEX', 11], rewards: [I.MULTITOOL], sanCost: 2, failHp: 4, failure: '마네킹의 손가락이 목덜미를 잡았다. HP -4.' }),
    point('c3_cctv', '③ CCTV 모니터실', '재생 중인 감시 화면', T.text_90, { check: ['INT', 12], flags: { knows_fan_circuit: true }, failSan: 3, failure: '화면 속 내 등 뒤에 검은 형체가 서 있다. SAN -3.' }),
    point('c4_gate', '④ 개찰구 교통카드 단말기', '불규칙하게 깜빡이는 단말', T.text_96, { check: ['LUK', 13], cardBypass: true, failHp: 3, failure: '함정 플랩이 몸을 압박했다. HP -3.' }),
    point('c5_pharmacy', '⑤ 셔터 틈 지하약국', '셔터 아래 약품 냄새', '내려앉은 셔터 틈으로 손을 뻗어 지혈용 압박붕대를 꺼냈다. 사용하면 HP 8을 회복한다.', { rewards: [I.BANDAGE], image: S.PHARMACY }),
    point('c6_duct', '⑥ 천장 배기 덕트', '위쪽에서 들리는 팬 소리', '배기 덕트 안쪽에 사다리가 이어진다. 축축한 바람 끝에 빗물 냄새가 묻어 있다. 지상으로 가는 수직 통로다.'),
  ] },
};
