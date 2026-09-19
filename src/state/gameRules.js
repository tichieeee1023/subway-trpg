import { ENDING_DEFINITIONS } from '../data/endingDB.js';
import { getEndingJobEpilogue } from '../data/endingJobEpilogues.js';

export const hasItem = (state, ...ids) => state.player.inventory.some((item) => ids.includes(item.id));
export const canAct = (state) => !state.activeModalText && !state.diceModal.isOpen && state.stage !== 'ENDING' && state.player.hp > 0 && state.player.san > 0;
export function finishGame(context, id, desc) {
  context.setActiveModalText(null);
  context.setEndingData({ ...ENDING_DEFINITIONS[id], ...(desc ? { desc } : {}), jobEpilogue: getEndingJobEpilogue(context.player.profileId, id) });
  context.setStage('ENDING');
}
export function checkCollapse(context) {
  const state = context.getState();
  if (state.player.hp > 0 && state.player.san > 0) return false;
  const id = state.stage === 'STAGE_1_CAR6' ? 'BAD_1' : state.stage === 'STAGE_3_PLATFORM' ? 'BAD_2' : 'BAD_3';
  finishGame(context, id, state.player.hp <= 0 ? '몸이 더는 움직이지 않는다. 붙잡은 도구가 손에서 떨어졌다.\n\n어둠 속에서 당신의 발걸음이 멎었다.' : '정신을 붙들던 마지막 끈이 끊어졌다. 안내방송은 이제 당신의 이름을 부른다.\n\n다음 역은, 돌아올 수 없는 곳이다.');
  return true;
}
export function applyDamage(player, hp = 0, san = 0) {
  const fear = player.trait.includes('잃을 게 없음') ? 0 : san;
  return { ...player, hp: Math.max(0, player.hp - hp), san: Math.max(0, player.san - fear) };
}
export function grantItems(player, items) {
  const inventory = [...player.inventory];
  for (const item of items) if (!inventory.some((existing) => existing.id === item.id)) inventory.push({ ...item });
  return { ...player, inventory };
}
