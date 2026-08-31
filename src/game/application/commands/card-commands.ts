import type { RunState } from '../../domain/run-state'
import { offerCards } from '../../simulation/round-resolution-system'
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
  const run = startRoundSix({ ...state.run, cards: [...state.run.cards, { cardId, round: 5 }], activeRuleEffects: [...state.run.activeRuleEffects, cardId], freeCloneTickets: state.run.freeCloneTickets + (cardId === 'free-clone' ? 3 : 0) }, context)
  return enqueueNotification({ ...state, run }, 'card-applied', { cardTitle: card.title })
}

export const equipPendingItem = (state: GameStoreState, unitId: number, context: SimulationContext): GameStoreState => {
  const unit = state.run.units.find((candidate) => candidate.id === unitId)
  const pending = state.run.pendingCard
  if (!unit || unit.item || !pending) return state
  const run = startRoundSix({ ...state.run, units: state.run.units.map((candidate) => candidate.id === unit.id ? { ...candidate, item: pending } : candidate), cards: [...state.run.cards, { cardId: pending, round: 5, unitId: unit.id }], pendingCard: undefined }, context)
  return enqueueNotification({ ...state, run }, 'item-attached', { unitName: context.config.units[unit.definitionId].name })
}

const startRoundSix = (run: RunState, context: SimulationContext): RunState => {
  const definition = context.config.roundDefinition(6)
  return { ...run, phase: 'combat', cardOffer: [], round: { number: 6, kind: definition.kind, remaining: definition.duration, started: true, spawnElapsed: 0, spawned: 0, total: definition.total }, pendingSpawns: definition.total }
}
