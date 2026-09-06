import { offerCards, prepareRound } from '../../simulation/round-resolution-system'
import type { CardId } from '../../domain/common'
import type { GameStoreState } from '../game-store-state'
import { enqueueNotification } from '../notification'
import type { SimulationContext } from '../../simulation/simulation-context'

export const rerollCards = (state: GameStoreState, context: SimulationContext): GameStoreState => {
  if (state.run.rerolls === 0) return state
  const rerolls = state.run.rerolls - 1
  return enqueueNotification({ ...state, run: offerCards({ ...state.run, rerolls }, context) }, 'card-rerolled', { remaining: rerolls })
}

export const chooseCard = (state: GameStoreState, cardId: CardId, context: SimulationContext): GameStoreState => {
  if (!state.run.cardOffer.includes(cardId)) return state
  const card = context.config.cards[cardId]
  if (card.kind === '아이템') return { ...state, run: { ...state.run, phase: 'item-targeting', pendingCard: cardId } }
  const completedRound = state.run.round.number
  const run = prepareRound({ ...state.run, cards: [...state.run.cards, { cardId, round: completedRound }], activeRuleEffects: [...state.run.activeRuleEffects, cardId], freeCloneTickets: state.run.freeCloneTickets + (cardId === 'free-clone' ? 3 : 0) }, context, completedRound + 1)
  return enqueueNotification({ ...state, run }, 'card-applied', { cardTitle: card.title })
}

export const equipPendingItem = (state: GameStoreState, unitId: number, context: SimulationContext): GameStoreState => {
  const unit = state.run.units.find((candidate) => candidate.id === unitId)
  const pending = state.run.pendingCard
  if (!unit || unit.item || !pending) return state
  const completedRound = state.run.round.number
  const run = prepareRound({ ...state.run, units: state.run.units.map((candidate) => candidate.id === unit.id ? { ...candidate, item: pending } : candidate), cards: [...state.run.cards, { cardId: pending, round: completedRound, unitId: unit.id }], pendingCard: undefined }, context, completedRound + 1)
  return enqueueNotification({ ...state, run }, 'item-attached', { unitName: context.config.units[unit.definitionId].name })
}

export const tickCardSelection = (state: GameStoreState, delta: number, context: SimulationContext): GameStoreState => {
  const remaining = state.run.cardSelectionRemaining
  if (remaining === undefined) return state
  if (remaining > delta) return { ...state, run: { ...state.run, cardSelectionRemaining: remaining - delta } }
  if (state.run.phase === 'item-targeting') {
    const unit = state.run.units.find((candidate) => !candidate.item)
    return unit ? equipPendingItem(state, unit.id, context) : { ...state, run: prepareRound(state.run, context, state.run.round.number + 1) }
  }
  const cardId = state.run.cardOffer[0]
  if (!cardId) return state
  const selected = chooseCard({ ...state, run: { ...state.run, cardSelectionRemaining: 0 } }, cardId, context)
  if (selected.run.phase !== 'item-targeting') return selected
  const unit = selected.run.units.find((candidate) => !candidate.item)
  return unit ? equipPendingItem(selected, unit.id, context) : { ...selected, run: prepareRound(selected.run, context, selected.run.round.number + 1) }
}
