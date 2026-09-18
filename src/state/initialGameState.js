export const createInitialGameState = () => ({
stage: 'SURVEY',
player: {
name: '김대리',
gender: 'M',
profileId: 'ENGINEER',
title: '분석형 엔지니어',
stats: { STR: 10, DEX: 10, INT: 14, WILL: 10, LUK: 10 },
hp: 20,
maxHp: 20,
san: 15,
maxSan: 15,
battery: 23,
trait: '준비 중',
inventory: []
},
ap: 3,
turnLimit: 3,
ventPhase: 1,
examinedPoints: [],
activeModalText: null,
pendingRewards: [],
flags: {
clue_acid_cloth: false,
warned_cabin: false,
valve_needs_wrench: false,
has_wrench: false,
seen_monster: false,
has_lantern: false,
knows_vent_shaft: false,
has_prybar: false,
anomalyCount: 0,
clueFakeStation: false,
has_master_card: false,
knows_fan_circuit: false,
fanStopped: false,
},
logs: [
"2026-09-18 00:30:12 : 심야 막차 6호차 탑승 확인."
],
diceModal: {
isOpen: false,
title: '',
statKey: 'INT',
dc: 10,
rolling: false,
result: null,
onSuccess: null,
onFail: null
},
endingData: null,
});

export const initialGameState = createInitialGameState();
