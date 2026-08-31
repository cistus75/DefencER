import type { CardId } from '../domain/common'
import type { RunState } from '../domain/run-state'
import { normalRoundReward } from '../domain/rules/economy-rules'
import { itemCards, ruleCards } from '../domain/rules/card-rules'
import type { SimulationContext } from './simulation-context'

const allCards: CardId[] = [...ruleCards, ...itemCards]

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
  return { ...run, phase: 'card-selection', cardOffer: candidates.slice(0, 3), randomSeed: seed }
}

export const resolveRound = (run: RunState, context: SimulationContext): RunState => {
  const dead = run.enemies.filter((enemy) => enemy.dead)
  const credits = run.credits + dead.reduce((sum, enemy) => sum + context.config.enemies[enemy.definitionId].reward, 0)
  let next = { ...run, enemies: run.enemies.filter((enemy) => !enemy.dead), credits }
  if (run.round.kind === 'boss') return dead.some((enemy) => enemy.definitionId === 'alpha') ? { ...next, phase: 'victory', result: 'alpha' } : run.round.remaining <= 0 ? { ...next, phase: 'defeat', result: 'timeout' } : next
  if (run.round.remaining > 0) return next
  next = { ...next, credits: next.credits + normalRoundReward(run.round.number) }
  if (run.round.number === 5) return offerCards(next, context)
  const number = run.round.number + 1
  const definition = context.config.roundDefinition(number)
  if (definition.kind === 'boss') {
    const id = next.entityCounters.enemy + 1
    const alpha = context.config.enemies.alpha
    return { ...next, phase: 'combat', round: { number, kind: definition.kind, remaining: definition.duration, started: true, spawnElapsed: 0, spawned: 1, total: definition.total }, pendingSpawns: 0, enemies: [...next.enemies, { id, definitionId: 'alpha', hp: alpha.hp, maxHp: alpha.hp, trackDistance: 0, travelledDistance: 0 }], entityCounters: { ...next.entityCounters, enemy: id } }
  }
  return { ...next, phase: 'combat', round: { number, kind: definition.kind, remaining: definition.duration, started: true, spawnElapsed: 0, spawned: 0, total: definition.total }, pendingSpawns: definition.total }
}
