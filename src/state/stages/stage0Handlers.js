import { FATIGUE_ROLL_TABLE } from '../../data/conditionDB.js';
import { SCENE_ASSETS } from '../../data/assetDB.js';

export function createStage0Handlers({ setStage, setPlayer, setActiveModalText, sfx, addLog, triggerGlitch, triggerScreenEffect = () => {}, openConditionDice, getState }) {
// ===========================================================================
// STAGE 0 : 캐릭터 생성 핸들러
// ===========================================================================
const handleSelectArchetype = (arch, gender = 'M') => {
if (getState().stage !== 'SURVEY') return;
sfx.playClick();
setPlayer((prev) => ({
...prev,
profileId: arch.id,
gender: gender === 'F' ? 'F' : 'M',
title: arch.title,
stats: arch.stats,
inventory: [...arch.items]
}));
addLog(`[캐릭터 생성] 성향 확정: ${arch.title}`);
setStage('DICE_CONDITION');
};

const handleRollCondition = () => {
if (getState().stage !== 'DICE_CONDITION' || getState().diceModal.isOpen || getState().activeModalText) return;
openConditionDice((roll) => {
const result = FATIGUE_ROLL_TABLE(roll);
setPlayer((prev) => ({
...prev,
hp: result.hp,
maxHp: result.hp,
san: result.san,
maxSan: 15,
trait: result.trait
}));
addLog(`[컨디션 롤] D20: ${roll} -> ${result.title} 부여 (${result.trait})`);
sfx.playSuccess();
setActiveModalText({
title: `오늘의 야근 컨디션: [D20 눈금: ${roll}]`,
body: result.desc,
tag: result.trait,
onClose: () => {
triggerGlitch(600);
triggerScreenEffect('blackout', 650);
addLog("00:37:04 : 전동차 급제동 및 전 구역 정전. 비상등 점멸.");
setActiveModalText({
  title: '00:37 AM — 암전',
  body: '전동차가 급정거했다. 모든 조명이 꺼지고, 어둠 속에서 승객들의 기척마저 사라졌다.',
  image: SCENE_ASSETS.BLACKOUT,
  onClose: () => {
    setActiveModalText(null);
    setStage('STAGE_1_CAR6');
  },
});
}
});
});
};


return { handleSelectArchetype, handleRollCondition };
}
