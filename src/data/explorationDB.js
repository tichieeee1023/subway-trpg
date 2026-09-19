import { ITEM_DATABASE as I } from './itemDB.js';
import { SCENARIO_TEXT as T } from './scenarioDB.js';
import { SCENE_ASSETS as S } from './assetDB.js';

const compactTags = {
  p1_padding: '버려진 소지품',
  p2_intercom: '끊긴 호출음',
  p3_valve: '출입문 수동 장치',
  p4_shelf: '선반 위 쇼핑백',
  p5_door: '유리 너머의 움직임',
  p6_floor: '검붉은 얼룩',

  t1_recess: '벽 안쪽 보관함',
  t2_phone: '끊기지 않는 발신음',
  t3_cart: '기름 묻은 작업 흔적',
  t4_rail: '위험한 고압 설비',
  t5_pump: '바닥에 고인 흙탕물',
  t6_extinguisher: '잠긴 점검함',

  m1_map: '이상한 역명',
  m2_vending: '멈춘 자판기',
  m3_mirror: '늦게 움직이는 반사',
  m4_office: '남겨진 역무원 흔적',
  m5_acid: '유리 틈의 점액',
  m6_breaker: '문 너머의 전류음',

  c1_store: '불 꺼진 계산대',
  c2_mannequin: '움직이는 마네킹',
  c3_cctv: '재생 중인 감시 화면',
  c4_gate: '깜빡이는 단말기',
  c5_pharmacy: '셔터 아래 약품 냄새',
  c6_duct: '천장 위 팬 소리',
};

const point = (id, title, tag, body, options = {}) => ({
  id,
  title,
  tag: compactTags[id] ?? tag,
  body,
  ...options,
});

export const EXPLORATION_STAGES = {
  STAGE_1_CAR6: {
    title: '암전된 6호차',
    color: 'cyan',
    points: [
      point(
        'p1_padding',
        '① 바닥에 버려진 외투',
        '버려진 소지품',
        T.text_2,
        {
          rewards: [I.CUTTER],
          immediateItem: I.POWERBANK,
          batteryGain: 20,
        }
      ),

      point(
        'p2_intercom',
        '② 벽면 비상 인터폰',
        '끊긴 호출음',
        T.text_5,
        {
          check: ['INT', 11],
          failSan: 2,
          failure: '수화기에서 날카로운 하울링이 터졌다. 머리가 울린다. SAN -2.',
        }
      ),

      point(
        'p3_valve',
        '③ 출입문 수동 밸브',
        '출입문 수동 장치',
        T.text_11
      ),

      point(
        'p4_shelf',
        '④ 선반 위 눌린 쇼핑백',
        '선반 위 쇼핑백',
        T.text_14,
        {
          rewards: [I.WRENCH],
        }
      ),

      point(
        'p5_door',
        '⑤ 7호차 쪽 유리창',
        '유리 너머의 움직임',
        T.text_17,
        {
          check: ['DEX', 12],
          sanCost: 2,
          failSan: 3,
          failure:
            '발끝이 빈 캔을 걷어찼다. 잠시 뒤, 유리창 반대편으로 검은 눈알이 쿵! 하고 부딪혔다. SAN -3.',
        }
      ),

      point(
        'p6_floor',
        '⑥ 바닥의 검붉은 얼룩',
        '검붉은 얼룩',
        '스마트폰 라이트를 비췄다. 떨어진 철조각으로 얼룩을 건드리자 쇠가 치이익 소리를 내며 녹아내렸다. 피가 아니다. 괴물의 강산성 소화액이다.',
        {
          flags: { knows_dissolution: true },
        }
      ),
    ],
  },

  STAGE_2_TUNNEL: {
    title: '선로 터널 300m',
    color: 'cyan',
    points: [
      point(
        't1_recess',
        '① 벽면 비상 대피 홈',
        '벽 안쪽 보관함',
        '보관함을 열자 고출력 안전 랜턴이 나왔다. [방수 안전 랜턴]을 챙겼다. 이제 스마트폰 배터리를 아끼며 어둠을 조사할 수 있다.',
        {
          check: ['INT', 11],
          rewards: [I.LANTERN],
          failHp: 3,
          failure: '그늘에 숨어 있던 유충을 건드렸다. 손등이 타는 듯 아프다. HP -3.',
        }
      ),

      point(
        't2_phone',
        '② 주황색 비상 전화기',
        '끊기지 않는 발신음',
        T.text_37,
        {
          check: ['INT', 11],
          failSan: 2,
          flags: { knows_vent_shaft: true },
          failure:
            '수화기 틈새에서 검은 진물이 흘러나왔다. 이어 낮은 속삭임이 들렸다. SAN -2.',
        }
      ),

      point(
        't3_cart',
        '③ 보수용 손수레',
        '기름 묻은 작업 흔적',
        T.text_43,
        {
          check: ['STR', 11],
          rewards: [I.CROWBAR],
          failure: T.text_46,
        }
      ),

      point(
        't4_rail',
        '④ 고압 설비 구간',
        '위험한 고압 설비',
        '젖은 바닥 옆으로 피복이 벗겨진 고압 케이블이 지나간다. 발을 잘못 디디면 감전될 수 있다.',
        {
          check: ['DEX', 12],
          failHp: 6,
          electrical: true,
          failure:
            '발이 미끄러지며 고압 케이블을 스쳤다. 절연장갑이 없다면 HP -6.',
        }
      ),

      point(
        't5_pump',
        '⑤ 집수정 배수 밸브',
        '바닥에 고인 흙탕물',
        '펌프실 흙탕물 속에서 공업용 절연 고무장갑을 발견했다. [절연 고무장갑]을 챙겼다. 감전과 산성액 접촉을 줄이는 데 쓸 수 있다.',
        {
          rewards: [I.RUBBER_GLOVES],
          image: S.PUMP,
        }
      ),

      point(
        't6_extinguisher',
        '⑥ 선로 점검함',
        '잠긴 점검함',
        '점검함 안에서 휴대용 분말 소화기를 꺼냈다. [휴대용 소화기]를 챙겼다. 분말로 괴물을 견제하거나 무거운 통 자체를 도구로 쓸 수 있다.',
        {
          check: ['STR', 10],
          rewards: [I.EXTINGUISHER],
          failHp: 2,
          failure: '고정 걸쇠가 튕겨 손등을 긁었다. HP -2.',
        }
      ),
    ],
  },

  STAGE_3_PLATFORM: {
    title: '신도림 환승역 플랫폼',
    color: 'emerald',
    points: [
      point(
        'm1_map',
        '① 종합 노선도 역명판',
        '이상한 역명',
        T.text_58,
        {
          check: ['INT', 11],
          rewards: [I.CLUE_MAP],
          anomaly: true,
          flags: { clueFakeStation: true },
          failure: T.text_61,
        }
      ),

      point(
        'm2_vending',
        '② 승강장 음료 자판기',
        '멈춘 자판기',
        '투입구 안에서 에너지 드링크 하나를 꺼냈다. [에너지 드링크]를 챙겼다.',
        {
          rewards: [I.ENERGY],
        }
      ),

      point(
        'm3_mirror',
        '③ 안전 볼록 거울',
        '늦게 움직이는 반사',
        T.text_67.replace('SAN -3', 'SAN -2'),
        {
          anomaly: true,
          sanCost: 2,
        }
      ),

      point(
        'm4_office',
        '④ 역무원 고객안내센터',
        '남겨진 역무원 흔적',
        T.text_70,
        {
          rewards: [I.CLUE_SKIN],
          anomaly: true,
        }
      ),

      point(
        'm5_acid',
        '⑤ 스크린도어 틈의 점액',
        '유리 틈의 점액',
        '유리 틈에 남은 산성 점액을 작은 병에 담았다. [산성 점액 채취병]을 챙겼다. 금속을 녹일 만큼 강한 액체다.',
        {
          rewards: [I.ACID_VIAL],
          acidContact: true,
        }
      ),

      point(
        'm6_breaker',
        '⑥ 배전실 점검문',
        '문 너머의 전류음',
        T.text_73
      ),
    ],
  },

  STAGE_4_MALL: {
    title: '지하 환승 상가',
    color: 'purple',
    points: [
      point(
        'c1_store',
        '① 24시 편의점 안쪽',
        '불 꺼진 계산대',
        '금전등록기 아래에서 [마스터 카드키]를 발견했다. 옆에 놓인 에너지 드링크도 함께 챙겼다. 카드키는 통제 구역의 잠금장치를 열 수 있다.',
        {
          rewards: [I.KEY_CARD, I.ENERGY],
        }
      ),

      point(
        'c2_mannequin',
        '② 쇼윈도 마네킹 무리',
        '움직이는 마네킹',
        T.text_84,
        {
          check: ['DEX', 11],
          rewards: [I.MULTITOOL],
          sanCost: 2,
          failHp: 4,
          failure: '마네킹의 손가락이 목덜미를 움켜쥐었다. HP -4.',
        }
      ),

      point(
        'c3_cctv',
        '③ CCTV 모니터실',
        '재생 중인 감시 화면',
        T.text_90,
        {
          check: ['INT', 12],
          flags: { knows_fan_circuit: true },
          failSan: 3,
          failure:
            '화면이 갑자기 바뀌었다. CCTV 속 내 등 뒤에 검은 형체가 서 있다. SAN -3.',
        }
      ),

      point(
        'c4_gate',
        '④ 개찰구 카드 단말기',
        '깜빡이는 단말기',
        T.text_96,
        {
          check: ['LUK', 13],
          cardBypass: true,
          failHp: 3,
          failure: '개찰구 플랩이 갑자기 닫히며 몸을 세게 압박했다. HP -3.',
        }
      ),

      point(
        'c5_pharmacy',
        '⑤ 셔터 틈 지하약국',
        '셔터 아래 약품 냄새',
        '셔터 틈으로 손을 뻗어 압박붕대를 꺼냈다. [압박 지혈 붕대]를 챙겼다. 사용하면 HP 8을 회복한다.',
        {
          rewards: [I.BANDAGE],
          image: S.PHARMACY,
        }
      ),

      point(
        'c6_duct',
        '⑥ 천장 배기 덕트',
        '천장 위 팬 소리',
        '덕트 안쪽에 위로 이어지는 사다리가 보인다. 틈 사이로 차가운 바람과 빗물 냄새가 들어온다. 지상으로 이어지는 통로다.'
      ),
    ],
  },
};