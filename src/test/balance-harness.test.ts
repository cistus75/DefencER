import { describe, expect, it } from 'vitest'
import { createInitialState } from '../game/application/create-initial-state'
import type { GameStoreState } from '../game/application/game-store-state'
import type { CardId, UnitDefinitionId } from '../game/domain/common'
import { cloneCost } from '../game/domain/rules/economy-rules'
import { gameReducer, simulationContext } from './state-builders'

type Policy = 'initial-four-only' | 'auto-spend' | 'auto-merge'

type RunSample = {
  seed: number
  result: 'alpha' | 'overflow' | 'timeout'
  seconds: number
  credits: number
  units: number
  maxEnemies: number
  initialUnits: Record<UnitDefinitionId, number>
}

const CARD_PRIORITY: CardId[] = ['outer-tactics', 'inner-tactics', 'free-clone', 'power-module', 'cube-watch', 'radar']
const MAX_SECONDS = 360
const SEED_COUNT = Math.max(1, Math.floor(Number((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.BALANCE_SEEDS) || 4))

const cloneWhileAffordable = (state: GameStoreState, limit = 20) => {
  let next = state
  while (
    next.run.units.length < limit
    && (next.run.freeCloneTickets > 0 || next.run.credits >= cloneCost(next.run.successfulCloneCount))
  ) next = gameReducer(next, { type: 'CLONE_UNIT' })
  return next
}

const mergeAvailable = (state: GameStoreState) => {
  let next = state
  for (;;) {
    const source = next.run.units.find((unit, index, units) =>
      unit.star < 5
      && units.some((candidate, candidateIndex) =>
        candidateIndex > index && candidate.definitionId === unit.definitionId && candidate.star === unit.star,
      ),
    )
    if (!source) return next
    const target = next.run.units.find((unit) =>
      unit.id !== source.id && unit.definitionId === source.definitionId && unit.star === source.star,
    )!
    next = gameReducer(next, { type: 'MOVE_OR_MERGE', sourceSlot: source.slot, targetSlot: target.slot })
  }
}

const resolveCardChoice = (state: GameStoreState) => {
  if (state.run.phase === 'card-selection') {
    const cardId = CARD_PRIORITY.find((candidate) => state.run.cardOffer.includes(candidate)) ?? state.run.cardOffer[0]
    return gameReducer(state, { type: 'CHOOSE_CARD', cardId })
  }
  if (state.run.phase === 'item-targeting') {
    const target = state.run.units.find((unit) => !unit.item)
    if (target) return gameReducer(state, { type: 'EQUIP_PENDING_ITEM', unitId: target.id })
  }
  return state
}

const runPolicy = (seed: number, policy: Policy): RunSample => {
  let state = cloneWhileAffordable(createInitialState(seed), 4)
  const initialUnits = state.run.units.reduce<Record<UnitDefinitionId, number>>(
    (counts, unit) => ({ ...counts, [unit.definitionId]: counts[unit.definitionId] + 1 }),
    { hyunwoo: 0, rio: 0, adina: 0, leni: 0 },
  )
  if (policy === 'auto-merge') state = mergeAvailable(state)
  state = gameReducer(state, { type: 'START_ROUND' })

  let ticks = 0
  let maxEnemies = 0
  const maxTicks = MAX_SECONDS / simulationContext.config.balance.fixedStep
  while (!['victory', 'defeat'].includes(state.run.phase) && ticks < maxTicks) {
    state = resolveCardChoice(state)
    if (policy !== 'initial-four-only') state = cloneWhileAffordable(state)
    if (policy === 'auto-merge') state = mergeAvailable(state)
    if (state.run.phase === 'combat') {
      state = gameReducer(state, { type: 'TICK', delta: simulationContext.config.balance.fixedStep })
      maxEnemies = Math.max(maxEnemies, state.run.enemies.length)
      ticks += 1
    }
  }

  if (!state.run.result) throw new Error(`seed ${seed} did not finish within ${MAX_SECONDS}s`)
  return {
    seed,
    result: state.run.result,
    seconds: ticks * simulationContext.config.balance.fixedStep,
    credits: state.run.credits,
    units: state.run.units.length,
    maxEnemies,
    initialUnits,
  }
}

const summarize = (policy: Policy, samples: RunSample[]) => ({
  policy,
  seeds: samples.length,
  wins: samples.filter((sample) => sample.result === 'alpha').length,
  winRate: `${Math.round(samples.filter((sample) => sample.result === 'alpha').length / samples.length * 100)}%`,
  overflow: samples.filter((sample) => sample.result === 'overflow').length,
  timeout: samples.filter((sample) => sample.result === 'timeout').length,
  averageSeconds: Math.round(samples.reduce((sum, sample) => sum + sample.seconds, 0) / samples.length),
  averageCredits: Math.round(samples.reduce((sum, sample) => sum + sample.credits, 0) / samples.length),
  averageUnits: Math.round(samples.reduce((sum, sample) => sum + sample.units, 0) / samples.length * 10) / 10,
  maxEnemies: Math.max(...samples.map((sample) => sample.maxEnemies)),
})

const roleBreakdown = (samples: RunSample[]) =>
  (['hyunwoo', 'rio', 'adina', 'leni'] as UnitDefinitionId[]).flatMap((unit) =>
    [0, 1, 2, 3, 4].map((count) => {
      const group = samples.filter((sample) => sample.initialUnits[unit] === count)
      const wins = group.filter((sample) => sample.result === 'alpha').length
      return { unit, count, seeds: group.length, wins, winRate: group.length ? `${Math.round(wins / group.length * 100)}%` : '-' }
    }).filter((group) => group.seeds > 0),
  )

describe('balance baseline', () => {
  it('compares deterministic player policies across spread seeds', () => {
    const seeds = Array.from({ length: SEED_COUNT }, (_, index) => Math.imul(index + 1, 0x9e3779b9) >>> 0)
    const initialFour = seeds.map((seed) => runPolicy(seed, 'initial-four-only'))
    const autoSpend = seeds.map((seed) => runPolicy(seed, 'auto-spend'))
    const autoMerge = seeds.map((seed) => runPolicy(seed, 'auto-merge'))

    console.table([
      summarize('initial-four-only', initialFour),
      summarize('auto-spend', autoSpend),
      summarize('auto-merge', autoMerge),
    ])
    console.table(roleBreakdown(initialFour))

    expect(initialFour[0]).toEqual(runPolicy(seeds[0], 'initial-four-only'))
    expect([...initialFour, ...autoSpend, ...autoMerge].every((sample) => ['alpha', 'overflow', 'timeout'].includes(sample.result))).toBe(true)
  }, 120_000)
})
