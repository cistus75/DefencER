import type { SimulationContext } from '../simulation/simulation-context'
import { chooseCard, equipPendingItem, rerollCards } from './commands/card-commands'
import { cloneUnit } from './commands/clone-unit'
import { discardUnit } from './commands/discard-unit'
import { resolveBoardDrop } from './commands/resolve-board-drop'
import { skipRound, startRound, tickCombat } from './commands/round-commands'
import { createInitialState } from './create-initial-state'
import type { GameAction } from './game-action'
import type { GameStoreState } from './game-store-state'
import { enqueueNotification } from './notification'

const phaseActions: Record<GameStoreState['run']['phase'], GameAction['type'][]> = {
  ready: ['START_ROUND', 'CLONE_UNIT', 'MOVE_OR_MERGE', 'DISCARD_UNIT', 'RESET_RUN', 'ACKNOWLEDGE_NOTIFICATION'],
  combat: ['TICK', 'CLONE_UNIT', 'MOVE_OR_MERGE', 'DISCARD_UNIT', 'SKIP_ROUND', 'RESET_RUN', 'ACKNOWLEDGE_NOTIFICATION'],
  'card-selection': ['CHOOSE_CARD', 'REROLL_CARDS', 'RESET_RUN', 'ACKNOWLEDGE_NOTIFICATION'],
  'item-targeting': ['EQUIP_PENDING_ITEM', 'RESET_RUN', 'ACKNOWLEDGE_NOTIFICATION'],
  victory: ['RESET_RUN', 'ACKNOWLEDGE_NOTIFICATION'],
  defeat: ['RESET_RUN', 'ACKNOWLEDGE_NOTIFICATION'],
}

export const createGameReducer = (context: SimulationContext) => (state: GameStoreState, action: GameAction): GameStoreState => {
  if (!phaseActions[state.run.phase].includes(action.type)) {
    return action.type === 'TICK' ? state : enqueueNotification(state, 'interaction-locked')
  }
  switch (action.type) {
    case 'RESET_RUN': return createInitialState(action.seed ?? context.random.next(state.run.randomSeed).seed)
    case 'ACKNOWLEDGE_NOTIFICATION': return { ...state, notifications: state.notifications.slice(1) }
    case 'START_ROUND': return startRound(state, context)
    case 'TICK': return tickCombat(state, action.delta, context)
    case 'CLONE_UNIT': return cloneUnit(state, context)
    case 'MOVE_OR_MERGE': return resolveBoardDrop(state, action.sourceSlot, action.targetSlot, context)
    case 'DISCARD_UNIT': return discardUnit(state, action.unitId, context)
    case 'SKIP_ROUND': return skipRound(state, context)
    case 'REROLL_CARDS': return rerollCards(state, context)
    case 'CHOOSE_CARD': return chooseCard(state, action.cardId, context)
    case 'EQUIP_PENDING_ITEM': return equipPendingItem(state, action.unitId, context)
  }
}
