import { describe, expect, it } from 'vitest'
import { createInitialState } from '../game/application/create-initial-state'
import type { GameStoreState } from '../game/application/game-store-state'
import type { CardId, UnitDefinitionId } from '../game/domain/common'
import { INNER_SLOTS, OUTER_SLOTS } from '../game/domain/rules/board-rules'
import { cloneCost } from '../game/domain/rules/economy-rules'
import { effectiveAps, effectiveAttack } from '../game/domain/rules/stat-rules'
import { gameReducer, simulationContext } from './state-builders'

type Policy = 'initial-four-only' | 'auto-spend' | 'auto-merge' | 'auto-merge-first-card' | 'strategic'

type RunSample = {
  seed: number
  result: 'wickeline' | 'overflow' | 'timeout'
  seconds: number
  credits: number
  units: number
  maxEnemies: number
  finalRound: number
  initialUnits: Record<UnitDefinitionId, number>
  cards: CardId[]
}

const CARD_PRIORITY: CardId[] = ['concentrated-fire', 'rapid-cycle', 'extended-sensors', 'outer-tactics', 'inner-tactics', 'free-clone', 'power-module', 'cube-watch', 'radar']
const MAX_SECONDS = 1600
const SEED_COUNT = Math.max(1, Math.floor(Number((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.BALANCE_SEEDS) || 4))

const cloneWhileAffordable = (state: GameStoreState, limit = 20) => {
  let next = state
  while (
    (next.run.phase === 'ready' || next.run.phase === 'combat')
    &&
    next.run.units.length < limit
    && (next.run.freeCloneTickets > 0 || next.run.credits >= cloneCost(next.run.successfulCloneCount))
  ) next = gameReducer(next, { type: 'CLONE_UNIT' })
  return next
}

const mergeAvailable = (state: GameStoreState) => {
  let next = state
  if (next.run.phase !== 'ready' && next.run.phase !== 'combat') return next
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

const mergeForSpace = (state: GameStoreState) => {
  if (state.run.units.length < 20 || (state.run.freeCloneTickets === 0 && state.run.credits < cloneCost(state.run.successfulCloneCount))) return state
  const source = state.run.units.find((unit, index, units) => unit.star < 5 && units.some((candidate, candidateIndex) => candidateIndex > index && candidate.definitionId === unit.definitionId && candidate.star === unit.star))
  if (!source) return state
  const target = state.run.units.find((unit) => unit.id !== source.id && unit.definitionId === source.definitionId && unit.star === source.star)!
  return gameReducer(state, { type: 'MOVE_OR_MERGE', sourceSlot: source.slot, targetSlot: target.slot })
}

const arrangeStrategically = (state: GameStoreState) => {
  if (state.run.phase !== 'ready') return state
  const favorInner = state.run.activeRuleEffects.includes('inner-tactics')
  const slots = favorInner ? [...INNER_SLOTS, ...OUTER_SLOTS] : [...OUTER_SLOTS, ...INNER_SLOTS]
  const units = [...state.run.units]
    .sort((left, right) => {
      if (favorInner && (left.definitionId === 'hyunwoo') !== (right.definitionId === 'hyunwoo')) return left.definitionId === 'hyunwoo' ? 1 : -1
      const leftDefinition = simulationContext.config.units[left.definitionId]
      const rightDefinition = simulationContext.config.units[right.definitionId]
      return effectiveAttack(rightDefinition, right.star, right.item) * effectiveAps(rightDefinition, right.item) - effectiveAttack(leftDefinition, left.star, left.item) * effectiveAps(leftDefinition, left.item)
    })
    .map((unit, index) => ({ ...unit, slot: slots[index] }))
  return { ...state, run: { ...state.run, units } }
}

const resolveCardChoice = (state: GameStoreState, policy: Policy) => {
  if (state.run.phase === 'card-selection') {
    const priority = policy === 'strategic'
      ? ['outer-tactics', 'inner-tactics', 'concentrated-fire', 'rapid-cycle', 'free-clone', 'power-module', 'cube-watch', 'extended-sensors', 'radar'] as CardId[]
      : CARD_PRIORITY
    const blocked = state.run.activeRuleEffects.includes('outer-tactics') ? 'inner-tactics' : state.run.activeRuleEffects.includes('inner-tactics') ? 'outer-tactics' : undefined
    const cardId = policy === 'auto-merge-first-card' ? state.run.cardOffer[0] : priority.find((candidate) => candidate !== blocked && state.run.cardOffer.includes(candidate)) ?? state.run.cardOffer.find((candidate) => candidate !== blocked) ?? state.run.cardOffer[0]
    return gameReducer(state, { type: 'CHOOSE_CARD', cardId })
  }
  if (state.run.phase === 'item-targeting') {
    const target = policy === 'strategic'
      ? [...state.run.units].filter((unit) => !unit.item).sort((left, right) => simulationContext.config.units[right.definitionId].attack - simulationContext.config.units[left.definitionId].attack)[0]
      : state.run.units.find((unit) => !unit.item)
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
  if (policy.startsWith('auto-merge')) state = mergeAvailable(state)
  if (policy === 'strategic') state = arrangeStrategically(state)
  state = gameReducer(state, { type: 'START_ROUND' })

  let ticks = 0
  let maxEnemies = 0
  const maxTicks = MAX_SECONDS / simulationContext.config.balance.fixedStep
  while (!['victory', 'defeat'].includes(state.run.phase) && ticks < maxTicks) {
    state = resolveCardChoice(state, policy)
    if (policy !== 'initial-four-only') state = cloneWhileAffordable(state)
    if (policy.startsWith('auto-merge')) state = mergeAvailable(state)
    if (policy === 'strategic') state = mergeForSpace(state)
    if (state.run.phase === 'ready') {
      if (policy === 'strategic') {
        if (state.run.activeRuleEffects.includes('inner-tactics')) state = mergeAvailable(state)
        state = arrangeStrategically(state)
      }
      state = gameReducer(state, { type: 'START_ROUND' })
    }
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
    finalRound: state.run.round.number,
    initialUnits,
    cards: state.run.cards.map((card) => card.cardId),
  }
}

const summarize = (policy: Policy, samples: RunSample[]) => ({
  policy,
  seeds: samples.length,
  wins: samples.filter((sample) => sample.result === 'wickeline').length,
  winRate: `${Math.round(samples.filter((sample) => sample.result === 'wickeline').length / samples.length * 100)}%`,
  overflow: samples.filter((sample) => sample.result === 'overflow').length,
  timeout: samples.filter((sample) => sample.result === 'timeout').length,
  averageSeconds: Math.round(samples.reduce((sum, sample) => sum + sample.seconds, 0) / samples.length),
  averageWinSeconds: Math.round(samples.filter((sample) => sample.result === 'wickeline').reduce((sum, sample) => sum + sample.seconds, 0) / (samples.filter((sample) => sample.result === 'wickeline').length || 1)),
  averageCredits: Math.round(samples.reduce((sum, sample) => sum + sample.credits, 0) / samples.length),
  averageUnits: Math.round(samples.reduce((sum, sample) => sum + sample.units, 0) / samples.length * 10) / 10,
  maxEnemies: Math.max(...samples.map((sample) => sample.maxEnemies)),
  averageFinalRound: Math.round(samples.reduce((sum, sample) => sum + sample.finalRound, 0) / samples.length * 10) / 10,
})

const failureBreakdown = (policy: Policy, samples: RunSample[]) =>
  Object.entries(samples.filter((sample) => sample.result !== 'wickeline').reduce<Record<string, number>>((groups, sample) => {
    const failure = `${sample.finalRound}-${sample.result}`
    return { ...groups, [failure]: (groups[failure] ?? 0) + 1 }
  }, {}))
    .map(([failure, seeds]) => ({ policy, failure, seeds }))
    .sort((left, right) => right.seeds - left.seeds)

const cardBreakdown = (samples: RunSample[]) => CARD_PRIORITY.map((card) => {
  const selected = samples.filter((sample) => sample.cards.includes(card))
  const wins = selected.filter((sample) => sample.result === 'wickeline').length
  return { card, selected: selected.length, selectionRate: `${Math.round(selected.length / samples.length * 100)}%`, winRate: selected.length ? `${Math.round(wins / selected.length * 100)}%` : '-' }
})

const roleBreakdown = (samples: RunSample[]) =>
  (['hyunwoo', 'rio', 'adina', 'leni'] as UnitDefinitionId[]).flatMap((unit) =>
    [0, 1, 2, 3, 4].map((count) => {
      const group = samples.filter((sample) => sample.initialUnits[unit] === count)
      const wins = group.filter((sample) => sample.result === 'wickeline').length
      return { unit, count, seeds: group.length, wins, winRate: group.length ? `${Math.round(wins / group.length * 100)}%` : '-' }
    }).filter((group) => group.seeds > 0),
  )

describe('balance baseline', () => {
  it('compares deterministic player policies across spread seeds', () => {
    const seeds = Array.from({ length: SEED_COUNT }, (_, index) => Math.imul(index + 1, 0x9e3779b9) >>> 0)
    const initialFour = seeds.map((seed) => runPolicy(seed, 'initial-four-only'))
    const autoSpend = seeds.map((seed) => runPolicy(seed, 'auto-spend'))
    const autoMerge = seeds.map((seed) => runPolicy(seed, 'auto-merge'))
    const autoMergeFirstCard = seeds.map((seed) => runPolicy(seed, 'auto-merge-first-card'))
    const strategic = seeds.map((seed) => runPolicy(seed, 'strategic'))

    console.table([
      summarize('initial-four-only', initialFour),
      summarize('auto-spend', autoSpend),
      summarize('auto-merge', autoMerge),
      summarize('auto-merge-first-card', autoMergeFirstCard),
      summarize('strategic', strategic),
    ])
    console.table(roleBreakdown(strategic))
    console.table([...failureBreakdown('auto-spend', autoSpend), ...failureBreakdown('auto-merge', autoMerge), ...failureBreakdown('strategic', strategic)])
    console.table(cardBreakdown(strategic))

    expect(initialFour[0]).toEqual(runPolicy(seeds[0], 'initial-four-only'))
    expect([...initialFour, ...autoSpend, ...autoMerge, ...autoMergeFirstCard, ...strategic].every((sample) => ['wickeline', 'overflow', 'timeout'].includes(sample.result))).toBe(true)
    if (seeds.length >= 4) {
      const mergeWinRate = autoMerge.filter((sample) => sample.result === 'wickeline').length / seeds.length
      const strategicWins = strategic.filter((sample) => sample.result === 'wickeline')
      const strategicWinRate = strategicWins.length / seeds.length
      const averageWinSeconds = strategicWins.reduce((sum, sample) => sum + sample.seconds, 0) / (strategicWins.length || 1)
      expect(mergeWinRate).toBeLessThanOrEqual(0.15)
      expect(strategicWinRate).toBeGreaterThanOrEqual(0.15)
      expect(strategicWinRate).toBeLessThanOrEqual(0.4)
      expect(strategicWinRate - mergeWinRate).toBeGreaterThanOrEqual(0.15)
      expect(averageWinSeconds).toBeGreaterThanOrEqual(1100)
      expect(averageWinSeconds).toBeLessThanOrEqual(1250)
      expect(autoSpend.filter((sample) => sample.result === 'wickeline')).toHaveLength(0)
    }
  }, 300_000)
})
