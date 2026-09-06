import type { CardId } from '../domain/common'
import type { RunState } from '../domain/run-state'
import { normalRoundReward } from '../domain/rules/economy-rules'
import { itemCards, ruleCards } from '../domain/rules/card-rules'
import type { SimulationContext } from './simulation-context'

const allCards: CardId[] = [...ruleCards, ...itemCards]
const isCardRound = (round: number) => round % 5 === 0 && round < 40

export const prepareRound = (run: RunState, context: SimulationContext, number: number): RunState => {
  const definition = context.config.roundDefinition(number)
  return {
    ...run,
    phase: 'ready',
    cardOffer: [],
    pendingCard: undefined,
    cardSelectionRemaining: undefined,
    round: { number, kind: definition.kind, remaining: definition.duration, started: false, spawnElapsed: 0, spawned: 0, total: definition.total },
    pendingSpawns: definition.total,
  }
}

export const offerCards = (run: RunState, context: SimulationContext): RunState => {
  let seed = run.randomSeed
  const available = allCards.filter((card) => !ruleCards.includes(card) || !run.activeRuleEffects.includes(card))
  const candidates = run.units.some((unit) => !unit.item) ? available : available.filter((card) => !itemCards.includes(card))
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const random = context.random.next(seed)
    seed = random.seed
    const target = Math.floor(random.value * (index + 1))
    ;[candidates[index], candidates[target]] = [candidates[target], candidates[index]]
  }
  return { ...run, phase: 'card-selection', cardOffer: candidates.slice(0, 3), cardSelectionRemaining: run.phase === 'card-selection' ? run.cardSelectionRemaining : 20, randomSeed: seed }
}

export const resolveRound = (run: RunState, context: SimulationContext): RunState => {
  const dead = run.enemies.filter((enemy) => enemy.dead)
  const credits = run.credits + dead.reduce((sum, enemy) => sum + context.config.enemies[enemy.definitionId].reward, 0)
  let next = { ...run, enemies: run.enemies.filter((enemy) => !enemy.dead), credits }
  if (run.round.kind === 'boss') {
    const bossId = context.config.roundDefinition(run.round.number).bossId
    const bossDefeated = dead.some((enemy) => enemy.definitionId === bossId)
    if (bossDefeated) {
      const cleared = { ...next, rerolls: next.rerolls + (run.round.number % 10 === 0 ? 1 : 0) }
      if (run.round.number === 40) return { ...cleared, phase: 'victory', result: 'wickeline' }
      return isCardRound(run.round.number) ? offerCards(cleared, context) : prepareRound(cleared, context, run.round.number + 1)
    }
    return run.round.remaining <= 0 ? { ...next, phase: 'defeat', result: 'timeout' } : next
  }
  if (run.round.remaining > 0) return next
  next = { ...next, credits: next.credits + normalRoundReward(run.round.number) }
  if (isCardRound(run.round.number)) return offerCards(next, context)
  return prepareRound(next, context, run.round.number + 1)
}
