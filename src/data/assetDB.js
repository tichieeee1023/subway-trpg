const asset = (path) => `${import.meta.env?.BASE_URL ?? '/'}assets/${path}`;

export const CHARACTER_PORTRAITS = Object.fromEntries(
  ['ENGINEER', 'GYM', 'RUNNER', 'NEGOTIATOR', 'GAMBLER'].map((id) => [id, {
    M: asset(`characters/char_${id.toLowerCase()}_m.webp`),
    F: asset(`characters/char_${id.toLowerCase()}_f.webp`),
  }]),
);

export const SCENE_ASSETS = {
  INTRO: { src: asset('scenes/scene_000_op.webp'), alt: '심야 지하철: 사라진 다음역 오프닝' },
  PROLOGUE_TRAIN: { src: asset('scenes/scene_prologue_train.webp'), alt: '비 내리는 자정, 00시 37분 막차가 역사로 들어온다' },
  BLACKOUT: { src: asset('scenes/scene_00_blackout.webp'), alt: '급정거와 함께 암전되는 심야 지하철' },
  STAGE_1_CAR6: { src: asset('scenes/scene_01_shedding.webp'), alt: '승객이 사라지고 옷가지만 남은 6호차' },
  MIMIC: { src: asset('scenes/scene_01b_mimic_centipede.webp'), alt: '7호차 문틈에서 다가오는 허물 괴물' },
  STAGE_2_TUNNEL: { src: asset('scenes/scene_02_tunnel.webp'), alt: '침묵에 잠긴 선로 터널 300m 지점' },
  PUMP: { src: asset('scenes/scene_stage2_tunnel_pump.webp'), alt: '선로 집수정 배수 펌프실' },
  PHARMACY: { src: asset('scenes/scene_stage4_pharmacy.webp'), alt: '셔터 틈으로 보이는 지하약국' },
  SECRET: { src: asset('scenes/scene_secret_report.webp'), alt: '04:44 AM 기밀 보고서와 회수 증거물' },
  STAGE_3_PLATFORM: { src: asset('scenes/scene_03_platform.webp'), alt: '사람의 흔적이 없는 신도림 환승역 승강장' },
  TRAP_EXIT: { src: asset('scenes/scene_03_trap_exit.webp'), alt: '거대한 아가리로 변한 가짜 3번 출구' },
  STAGE_4_MALL: { src: asset('scenes/scene_04_mall.webp'), alt: '셔터가 내려진 지하 환승 상가' },
  STAGE_5_VENT: { src: asset('scenes/scene_05_vent_fan.webp'), alt: '거대 배기팬이 가로막은 수직 환기 갱도' },
};

export const ENDING_CARDS = {
  BAD_1: asset('cards/card_bad_end1.webp'),
  BAD_2: asset('cards/card_bad_end2.webp'),
  BAD_3: asset('cards/card_bad_end3.webp'),
  BAD_4: asset('cards/card_bad_end4.webp'),
  NORMAL: asset('cards/card_normal_end.webp'),
  GOOD: asset('cards/card_good_end.webp'),
  TRUE: asset('cards/card_true_end.webp'),
};

export const PUBLIC_ASSET_FILES = Object.fromEntries([
  ...Object.values(CHARACTER_PORTRAITS).flatMap((portraits) => Object.values(portraits)),
  ...Object.values(SCENE_ASSETS).map((scene) => scene.src),
  ...Object.values(ENDING_CARDS),
].map((url) => [`public/assets/${url.split('/assets/')[1]}`, url]));
