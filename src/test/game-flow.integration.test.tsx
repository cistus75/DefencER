import { describe, expect, it } from 'vitest'
import { createInitialState } from '../game/application/create-initial-state'
import { gameReducer, simulationContext } from './state-builders'
import { cloneCost } from '../game/domain/rules/economy-rules'
import { firstEmptySlot, INNER_SLOTS, OUTER_SLOTS } from '../game/domain/rules/board-rules'
import { effectiveAps, effectiveAttack, effectiveRange } from '../game/domain/rules/stat-rules'
import { unitDefinitions } from '../game/config/unit-definitions'
import { spawnEnemies } from '../game/simulation/spawn-system'
import { pointOnTrack, trackLength } from '../game/config/battlefield-config'
import type { GameStoreState } from '../game/application/game-store-state'

const expireNormalRound = (state: GameStoreState) => gameReducer({ ...state, run: { ...state.run, round: { ...state.run.round, remaining: 0 }, enemies: [], projectiles: [], pendingSpawns: 0 } }, { type: 'TICK', delta: 1 / 60 })

describe('DefencER 1~10 prototype seams', () => {
  it('ready→round1→round5→card→round6→alpha→victory 전체 흐름을 고정 seed로 완료한다', () => {
    let state = gameReducer(createInitialState(101), { type: 'START_ROUND' })
    expect(state.run).toMatchObject({ phase: 'combat', round: { number: 1 }, pendingSpawns: 5 })
    for (let round = 1; round <= 4; round += 1) {
      state = expireNormalRound(state)
      expect(state.run.round.number).toBe(round + 1)
    }
    state = expireNormalRound(state)
    expect(state.run.phase).toBe('card-selection')
    expect(state.run.cardOffer).toHaveLength(3)
    state = gameReducer(state, { type: 'CHOOSE_CARD', cardId: state.run.cardOffer[0] })
    expect(state.run).toMatchObject({ phase: 'combat', round: { number: 6 } })
    for (let round = 6; round <= 9; round += 1) state = expireNormalRound(state)
    expect(state.run).toMatchObject({ phase: 'combat', round: { number: 10 }, enemies: [expect.objectContaining({ definitionId: 'alpha', hp: 3200 })] })
    const alpha = state.run.enemies.find((enemy) => enemy.definitionId === 'alpha')!
    state = gameReducer({ ...state, run: { ...state.run, projectiles: [{ id: 1, sourceId: 0, targetId: alpha.id, kind: 'skill', damage: 3200, speed: 900, delay: 0, position: pointOnTrack(alpha.trackDistance) }], entityCounters: { ...state.run.entityCounters, projectile: 1 } } }, { type: 'TICK', delta: 1 / 60 })
    expect(state.run).toMatchObject({ phase: 'victory', result: 'alpha' })
  })

  it('일반 라운드 종료는 생존 필드 적과 투사체를 이월하고 생존 보상을 지급한다', () => {
    const initial = createInitialState(1)
    const survivor = { id: 1, definitionId: 'normal' as const, hp: 90, maxHp: 90, trackDistance: 0, travelledDistance: 0 }
    const projectile = { id: 1, sourceId: 1, targetId: 1, kind: 'basic' as const, damage: 1, speed: 0, delay: 0, position: pointOnTrack(0) }
    const next = gameReducer({ ...initial, run: { ...initial.run, phase: 'combat', round: { ...initial.run.round, remaining: 0 }, enemies: [survivor], projectiles: [projectile], pendingSpawns: 0 } }, { type: 'TICK', delta: 1 / 60 })
    expect(next.run.round.number).toBe(2)
    expect(next.run.credits).toBe(150)
    expect(next.run.enemies).toHaveLength(1)
    expect(next.run.projectiles).toHaveLength(1)
  })

  it('빈 필드 스킵은 시간 종료와 같은 보상·다음 라운드 경로를 사용한다', () => {
    const initial = createInitialState(1)
    const combat = { ...initial, run: { ...initial.run, phase: 'combat' as const, pendingSpawns: 0 } }
    const next = gameReducer(combat, { type: 'SKIP_ROUND' })
    expect(next.run).toMatchObject({ credits: 150, phase: 'combat', round: { number: 2 } })
    expect(next.notifications.at(-1)?.code).toBe('round-skipped')
  })
  it('starts with 100 credits and advances clone costs 10/20/30/40', () => {
    let state = createInitialState(42)
    expect(state.run.credits).toBe(100)
    expect([0, 1, 2, 3].map(cloneCost)).toEqual([10, 20, 30, 40])
    for (let i = 0; i < 4; i += 1) state = gameReducer(state, { type: 'CLONE_UNIT' })
    expect(state.run.credits).toBe(0)
    expect(state.run.successfulCloneCount).toBe(4)
  })

  it('keeps seed and economy on a failed clone', () => {
    const state = createInitialState(42)
    const full = { ...state, run: { ...state.run, units: Array.from({ length: 20 }, (_, id) => ({ id, definitionId: 'hyunwoo' as const, slot: id, star: 1 as const, attackCooldown: 0, skillCooldown: 4, actionLock: 0, marks: [] })) } }
    const next = gameReducer(full, { type: 'CLONE_UNIT' })
    expect(next.run.randomSeed).toBe(full.run.randomSeed)
    expect(next.run.credits).toBe(100)
    expect(firstEmptySlot(full.run.units)).toBeUndefined()
  })

  it('uses 14 outer slots and 6 inner slots', () => {
    expect(OUTER_SLOTS).toHaveLength(14)
    expect(INNER_SLOTS).toHaveLength(6)
  })

  it('moves, swaps, merges, and preserves the 기준 실험체 item', () => {
    const base = createInitialState(1)
    const units = [
      { id: 1, definitionId: 'hyunwoo' as const, slot: 0, star: 1 as const, item: 'radar' as const, attackCooldown: 0, skillCooldown: 4, actionLock: 0, marks: [] },
      { id: 2, definitionId: 'hyunwoo' as const, slot: 1, star: 1 as const, attackCooldown: 0, skillCooldown: 4, actionLock: 0, marks: [] },
    ]
    const merged = gameReducer({ ...base, run: { ...base.run, units } }, { type: 'MOVE_OR_MERGE', sourceSlot: 1, targetSlot: 0 })
    expect(merged.run.units).toEqual([expect.objectContaining({ id: 1, slot: 0, star: 2, item: 'radar' })])
    const swapped = gameReducer({ ...base, run: { ...base.run, units: [{ ...units[0], slot: 0 }, { ...units[1], definitionId: 'rio', slot: 1 }] } }, { type: 'MOVE_OR_MERGE', sourceSlot: 0, targetSlot: 1 })
    expect(swapped.run.units.map(unit => unit.slot).sort()).toEqual([0, 1])
  })

  it('applies fixed stat rules', () => {
    expect(effectiveAttack(unitDefinitions.hyunwoo, 2)).toBe(40.8)
    expect(effectiveAttack(unitDefinitions.hyunwoo, 5)).toBe(79.56)
    expect(effectiveAttack(unitDefinitions.hyunwoo, 1, 'power-module')).toBe(40.8)
    expect(effectiveRange(unitDefinitions.rio, 'radar')).toBe(4.2)
    expect(effectiveAps(unitDefinitions.rio, 'cube-watch')).toBeCloseTo(1.593)
    expect(effectiveAttack(unitDefinitions.hyunwoo, 1, undefined, ['outer-tactics'], 0)).toBeCloseTo(40.8)
    expect(effectiveAttack(unitDefinitions.hyunwoo, 1, undefined, ['outer-tactics'], 6)).toBeCloseTo(28.9)
    expect(effectiveAttack(unitDefinitions.hyunwoo, 1, undefined, ['inner-tactics'], 0)).toBeCloseTo(30.6)
    expect(effectiveAttack(unitDefinitions.hyunwoo, 1, undefined, ['inner-tactics'], 6)).toBeCloseTo(42.5)
  })

  it('spawns at 0.3 seconds and makes every fifth r5 enemy fast', () => {
    const state = createInitialState(1).run
    const spawned = spawnEnemies({ ...state, round: { ...state.round, number: 5, total: 9 }, pendingSpawns: 9 }, simulationContext, .9)
    expect(spawned.enemies).toHaveLength(3)
    const five = spawnEnemies({ ...state, round: { ...state.round, number: 5, total: 9 }, pendingSpawns: 9 }, simulationContext, 1.5)
    expect(five.enemies[4].definitionId).toBe('fast')
  })

  it('returns to track origin after a loop', () => {
    expect(pointOnTrack(0)).toEqual(pointOnTrack(trackLength))
  })

  it('enters card selection after round five and applies a rule to round six', () => {
    let state = createInitialState(7)
    state = { ...state, run: { ...state.run, phase: 'combat', round: { number: 5, kind: 'normal', remaining: .01, started: true, spawnElapsed: 0, spawned: 9, total: 9 }, pendingSpawns: 0 } }
    state = gameReducer(state, { type: 'TICK', delta: 1 / 60 })
    expect(state.run.phase).toBe('card-selection')
    const rule = state.run.cardOffer.find(card => ['free-clone', 'outer-tactics', 'inner-tactics'].includes(card))
    if (rule) state = gameReducer(state, { type: 'CHOOSE_CARD', cardId: rule })
    expect(['card-selection', 'combat']).toContain(state.run.phase)
  })

  it('defeats immediately when the 50th field enemy appears', () => {
    const state = createInitialState(1).run
    const enemies = Array.from({ length: 49 }, (_, id) => ({ id, definitionId: 'normal' as const, hp: 90, maxHp: 90, trackDistance: 0, travelledDistance: 0 }))
    const next = gameReducer({ run: { ...state, phase: 'combat', enemies, pendingSpawns: 1, round: { ...state.round, spawnElapsed: .3 } }, notifications: [] }, { type: 'TICK', delta: 1 / 60 })
    expect(next.run.phase).toBe('defeat')
    expect(next.run.result).toBe('overflow')
  })

  it('50번째 spawn 프레임에는 사거리 안 실험체도 공격하지 못한다', () => {
    const state = createInitialState(1).run
    const enemies = Array.from({ length: 49 }, (_, id) => ({ id: id + 1, definitionId: 'normal' as const, hp: 90, maxHp: 90, trackDistance: 0, travelledDistance: 0 }))
    const unit = { id: 1, definitionId: 'rio' as const, slot: 0, star: 1 as const, attackCooldown: 0, skillCooldown: 0, actionLock: 0, marks: [] }
    const next = gameReducer({ run: { ...state, phase: 'combat', units: [unit], enemies, pendingSpawns: 1, round: { ...state.round, spawnElapsed: .3 }, entityCounters: { ...state.entityCounters, enemy: 49, unit: 1 } }, notifications: [] }, { type: 'TICK', delta: 1 / 60 })
    expect(next.run.phase).toBe('defeat')
    expect(next.run.projectiles).toHaveLength(0)
  })
})
