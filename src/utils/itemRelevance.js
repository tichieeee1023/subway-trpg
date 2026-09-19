const STAGE_RELEVANCE = {
  STAGE_1_CAR6: ['wrench'],
  STAGE_2_TUNNEL: ['rubber_gloves', 'lantern', 'crowbar', 'extinguisher'],
  STAGE_3_PLATFORM: ['clue_map'],
  STAGE_4_MALL: ['key_card', 'multitool'],
};

const VENT_RELEVANCE = {
  1: ['crowbar', 'wrench', 'multitool', 'acid_vial', 'laptop_bag', 'tumbler', 'extinguisher'],
  2: ['lantern', 'extinguisher', 'cutter'],
  3: ['crowbar', 'wrench', 'tumbler', 'extinguisher'],
};

const FAKE_STATION_RELEVANCE = {
  1: ['glasses', 'lantern', 'extinguisher', 'cutter', 'metal_pen', 'acid_vial', 'laptop_bag'],
  2: ['crowbar', 'wrench', 'tumbler', 'lanyard', 'running_shoes', 'lotto', 'lucky_coin'],
};

export function getRelevantItemIds(stage, ventPhase, flags = {}) {
  if (stage === 'STAGE_3_PLATFORM' && flags.fakeStationResistance) {
    return FAKE_STATION_RELEVANCE[flags.fakeStationPhase] ?? [];
  }
  return stage === 'STAGE_5_VENT' ? (VENT_RELEVANCE[ventPhase] ?? []) : (STAGE_RELEVANCE[stage] ?? []);
}
