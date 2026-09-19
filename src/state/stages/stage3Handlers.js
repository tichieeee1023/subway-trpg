import { createExplorationHandlers } from './explorationHandlers.js';
import { createFakeStationResistanceHandler } from './fakeStationResistance.js';

export function createStage3Handlers(context) {
  const { enter, ...handlers } = createExplorationHandlers(context, 'STAGE_3_PLATFORM');
  return {
    examinePlatformPoint: handlers.examine,
    choosePlatformExit: handlers.choosePlatformExit,
    handleFakeStationResistance: createFakeStationResistanceHandler(context, enter),
  };
}
