const item = (id, name, file, desc = '') => ({ id, name, img: `/assets/items/${file}.webp`, desc });

export const ITEM_DATABASE = {
  DICE_IDLE: item('dice_idle', 'D20 주사위', 'item_dice_idle'),
  DICE_ROLL: item('dice_roll', '회전 중...', 'item_dice_rolling2'),
  DICE_SUCCESS: item('dice_success', '성공', 'item_dice_success'),
  DICE_FAIL: item('dice_fail', '실패', 'item_dice_fail'),
  DICE_CRIT_WIN: item('dice_crit_win', '대성공 (20)', 'item_dice_crit_success'),
  DICE_CRIT_LOSE: item('dice_crit_lose', '대실패 (1)', 'item_dice_crit_fail'),

  WRENCH: item('wrench', '비상 스패너', 'item_tool_wrench', '밸브 개폐 및 둔기'),
  CROWBAR: item('crowbar', '쇠지렛대', 'item_tool_crowbar', '강력한 둔기 및 문 개방'),
  CUTTER: item('cutter', '소형 커터칼', 'item_tool_cutter', '절단용 도구'),
  LANTERN: item('lantern', '방수 랜턴', 'item_tool_lantern', '배터리 소모 면제'),
  MULTITOOL: item('multitool', '접이식 멀티툴', 'item_tool_multitool', '정밀 도구'),
  EXTINGUISHER: item('extinguisher', '휴대용 소화기', 'item_tool_extinguisher', '촉수 견제 · 맨홀 타격'),
  RUBBER_GLOVES: item('rubber_gloves', '절연 고무장갑', 'item_tool_rubber_gloves', '감전 · 산성액 접촉 피해 감소'),
  BANDAGE: { ...item('bandage', '압박 지혈 붕대', 'item_tool_bandage', '사용 시 HP +8'), consumable: true, hpRestore: 8 },
  ACID_VIAL: item('acid_vial', '산성 점액 채취병', 'item_clue_acid_vial', '배기팬 용해 · 사용 시 소모'),

  KEY_CARD: item('key_card', '마스터 카드키', 'item_key_card', '방화문 전자 잠금 해제'),
  KEY_BRASS: item('key_brass', '황동 열쇠', 'item_key_brass'),
  POWERBANK: item('powerbank', '보조배터리', 'item_device_powerbank', '충전 완료'),
  PHONE: item('phone', '스마트폰', 'item_device_phone'),

  BAG: item('laptop_bag', '노트북 가방', 'item_gear_laptop_bag', '둔기/방패 대용'),
  TUMBLER: item('tumbler', '보냉 텀블러', 'item_gear_tumbler', '묵직한 금속 둔기'),
  LANYARD: item('lanyard', '사원증 목걸이', 'item_gear_lanyard', '도구 조작용 와이어'),
  CANDY: { ...item('candy', '멘톨 캔디', 'item_gear_candy', '사용 시 SAN +3'), consumable: true, sanRestore: 3 },
  LOTTO: item('lotto', '스피또 복권', 'item_gear_lotto_coin', '기적을 바라는 부적'),

  ENERGY: { ...item('energy_drink', '에너지 드링크', 'item_energy_drink', '사용 시 HP +5'), consumable: true, hpRestore: 5 },
  CLUE_SKIN: item('clue_skin', '역무원 허물', 'item_clue_skin'),
  CLUE_MAP: item('clue_map', '왜곡된 노선도', 'item_clue_torn_map'),
  CLUE_SHOES: item('clue_shoes', '녹아내린 구두', 'item_clue_melted_shoes'),
  RECEIPT: item('receipt', '편의점 영수증', 'item_clue_receipt'),
};

export const ITEM_DB = {
  laptop_bag: ITEM_DATABASE.BAG,
  tumbler: ITEM_DATABASE.TUMBLER,
  id_wire: ITEM_DATABASE.LANYARD,
  candy: ITEM_DATABASE.CANDY,
  lottery: ITEM_DATABASE.LOTTO,
  cutter: ITEM_DATABASE.CUTTER,
  powerbank: ITEM_DATABASE.POWERBANK,
  wrench: ITEM_DATABASE.WRENCH,
  lantern: ITEM_DATABASE.LANTERN,
  prybar: ITEM_DATABASE.CROWBAR,
  master_key: ITEM_DATABASE.KEY_BRASS,
  master_card: ITEM_DATABASE.KEY_CARD,
  multitool: ITEM_DATABASE.MULTITOOL,
  glasses: { id: 'glasses', name: '블루라이트 차단 안경', desc: '세부 관찰 보조', icon: '👓' },
  protein_bar: { id: 'protein_bar', name: '단백질 바', desc: '사용 시 HP +5', icon: '🍫', consumable: true, hpRestore: 5 },
  running_shoes: { id: 'running_shoes', name: '쿠션 러닝화', desc: '민첩 기동 보조', icon: '👟' },
  metal_pen: { id: 'metal_pen', name: '고급 금속 만년필', desc: '날카로운 비상 찌르개', icon: '🖊️' },
  lucky_coin: item('lucky_coin', '행운의 100원 동전', 'item_gear_coin', '도구 틈새 쐐기'),
};

export const ITEM_ASSET_FILES = Object.fromEntries(
  Object.values(ITEM_DATABASE).map(({ img }) => [`public${img}`, img]),
);
