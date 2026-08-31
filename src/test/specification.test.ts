import { describe, expect, it } from 'vitest'
import { createInitialState } from '../game/application/create-initial-state'
import { gameReducer, simulationContext } from './state-builders'
import type { GameStoreState } from '../game/application/game-store-state'
import { pointOnTrack, slotCenter, trackLength } from '../game/config/battlefield-config'
import { unitDefinitions } from '../game/config/unit-definitions'
import type { EnemyInstance } from '../game/domain/enemy'
import type { UnitInstance } from '../game/domain/unit'
import { chooseTarget } from '../game/domain/rules/targeting-rules'
import { moveEnemies } from '../game/simulation/enemy-movement-system'
import { moveProjectiles } from '../game/simulation/projectile-system'
import { offerCards } from '../game/simulation/round-resolution-system'
import { spawnEnemies } from '../game/simulation/spawn-system'

const unit = (overrides: Partial<UnitInstance> = {}): UnitInstance => ({
  id: 1,
  definitionId: 'hyunwoo',
  slot: 0,
  star: 1,
  attackCooldown: 0,
  skillCooldown: 4,
  actionLock: 0,
  marks: [],
  ...overrides,
})

const enemy = (overrides: Partial<EnemyInstance> = {}): EnemyInstance => ({
  id: 1,
  definitionId: 'normal',
  hp: 90,
  maxHp: 90,
  trackDistance: 0,
  travelledDistance: 0,
  ...overrides,
})

describe('배치·복제·폐기 명세', () => {
  it('같은 seed와 action 순서는 RNG·엔티티 ID를 포함해 같은 상태를 만든다', () => {
    const actions = [{ type: 'CLONE_UNIT' as const }, { type: 'CLONE_UNIT' as const }, { type: 'MOVE_OR_MERGE' as const, sourceSlot: 0, targetSlot: 7 }]
    const execute = () => actions.reduce(gameReducer, createInitialState(1234))
    expect(execute()).toEqual(execute())
  })

  it('삭제한 엔티티 ID를 재사용하지 않고 행 우선 첫 빈 슬롯을 채운다', () => {
    let state = gameReducer(createInitialState(9), { type: 'CLONE_UNIT' })
    state = gameReducer(state, { type: 'DISCARD_UNIT', unitId: 1 })
    state = gameReducer(state, { type: 'CLONE_UNIT' })
    expect(state.run.units[0]).toMatchObject({ id: 2, slot: 0 })
  })

  it('가용 슬롯이 없으면 무료 복제권과 seed를 보존한다', () => {
    const initial = createInitialState(9)
    const units = Array.from({ length: 20 }, (_, index) => unit({ id: index + 1, slot: index }))
    const state = { ...initial, run: { ...initial.run, units, freeCloneTickets: 3 } }
    const next = gameReducer(state, { type: 'CLONE_UNIT' })
    expect(next.run).toMatchObject({ freeCloneTickets: 3, randomSeed: 9, successfulCloneCount: 0 })
  })

  it('잘못된 phase 조작은 gameplay를 유지하고 최대 5개 interaction notification만 쌓는다', () => {
    const initial = createInitialState(9)
    let state: GameStoreState = { ...initial, run: { ...initial.run, phase: 'card-selection', cardOffer: ['free-clone'] } }
    for (let index = 0; index < 7; index += 1) state = gameReducer(state, { type: 'CLONE_UNIT' })
    expect(state.run).toEqual({ ...initial.run, phase: 'card-selection', cardOffer: ['free-clone'] })
    expect(state.notifications).toHaveLength(5)
    expect(state.notifications.every((notification) => notification.code === 'interaction-locked')).toBe(true)
  })

  it('무료 복제권을 먼저 쓰고 성공 횟수와 비용 단계는 증가한다', () => {
    const initial = createInitialState(5)
    const state = { ...initial, run: { ...initial.run, freeCloneTickets: 1 } }
    const next = gameReducer(state, { type: 'CLONE_UNIT' })
    expect(next.run).toMatchObject({ credits: 100, freeCloneTickets: 0, successfulCloneCount: 1 })
    expect(next.notifications.at(-1)).toEqual({ id: 1, code: 'clone-succeeded', payload: { unitName: simulationContext.config.units[next.run.units[0].definitionId].name, slot: 1 } })
  })

  it('크레딧 부족 실패는 무료권·seed·횟수를 모두 보존한다', () => {
    const initial = createInitialState(5)
    const state = { ...initial, run: { ...initial.run, credits: 0 } }
    const next = gameReducer(state, { type: 'CLONE_UNIT' })
    expect(next.run).toMatchObject({ credits: 0, freeCloneTickets: 0, successfulCloneCount: 0, randomSeed: 5 })
  })

  it('전투 중 이동·교환·새 복제는 0.75초 행동 잠금을 건다', () => {
    const initial = createInitialState(2)
    const combat = { ...initial, run: { ...initial.run, phase: 'combat' as const, units: [unit(), unit({ id: 2, definitionId: 'rio', slot: 1 })] } }
    const moved = gameReducer(combat, { type: 'MOVE_OR_MERGE', sourceSlot: 0, targetSlot: 2 })
    expect(moved.run.units.find((candidate) => candidate.id === 1)?.actionLock).toBe(0.75)
    const swapped = gameReducer(combat, { type: 'MOVE_OR_MERGE', sourceSlot: 0, targetSlot: 1 })
    expect(swapped.run.units.map((candidate) => candidate.actionLock)).toEqual([0.75, 0.75])
    const cloned = gameReducer(combat, { type: 'CLONE_UNIT' })
    expect(cloned.run.units.at(-1)).toMatchObject({ attackCooldown: 0, actionLock: 0.75 })
  })

  it('합성은 기준 실험체의 ID·슬롯·아이템·표식을 유지하고 합성 재료 아이템은 소멸한다', () => {
    const initial = createInitialState(2)
    const target = unit({ id: 1, slot: 0, item: 'radar', marks: [{ sourceId: 9, remaining: 3, ratio: 0.2 }] })
    const material = unit({ id: 2, slot: 1, item: 'power-module' })
    const merged = gameReducer({ ...initial, run: { ...initial.run, units: [target, material] } }, { type: 'MOVE_OR_MERGE', sourceSlot: 1, targetSlot: 0 })
    expect(merged.run.units).toEqual([{ ...target, star: 2, attackCooldown: 0, skillCooldown: 4 }])
  })

  it('5성끼리는 합성하지 않고 교환하며 아이템·5성은 폐기할 수 없다', () => {
    const initial = createInitialState(2)
    const fiveA = unit({ id: 1, slot: 0, star: 5 })
    const fiveB = unit({ id: 2, slot: 1, star: 5 })
    const swapped = gameReducer({ ...initial, run: { ...initial.run, units: [fiveA, fiveB] } }, { type: 'MOVE_OR_MERGE', sourceSlot: 0, targetSlot: 1 })
    expect(swapped.run.units).toHaveLength(2)
    expect(swapped.run.units.map((candidate) => candidate.slot)).toEqual([1, 0])
    expect(gameReducer({ ...initial, run: { ...initial.run, units: [fiveA] } }, { type: 'DISCARD_UNIT', unitId: 1 }).run.units).toHaveLength(1)
    expect(gameReducer({ ...initial, run: { ...initial.run, units: [unit({ item: 'radar' })] } }, { type: 'DISCARD_UNIT', unitId: 1 }).run.units).toHaveLength(1)
  })
})

describe('spawn·이동·타기팅·피해 명세', () => {
  it('r6은 5번째와 10번째 spawn이 fast다', () => {
    const run = createInitialState(1).run
    const next = spawnEnemies({ ...run, round: { ...run.round, number: 6, total: 10 }, pendingSpawns: 10 }, simulationContext, 3)
    expect(next.enemies[4].definitionId).toBe('fast')
    expect(next.enemies[9].definitionId).toBe('fast')
  })

  it('한 바퀴 이동 후 좌표는 복귀하고 누적 이동 거리는 유지된다', () => {
    const run = createInitialState(1).run
    const speed = 90
    const next = moveEnemies({ ...run, enemies: [enemy()] }, simulationContext, trackLength / speed)
    expect(pointOnTrack(next.enemies[0].trackDistance).x).toBeCloseTo(pointOnTrack(0).x)
    expect(pointOnTrack(next.enemies[0].trackDistance).y).toBeCloseTo(pointOnTrack(0).y)
    expect(next.enemies[0].travelledDistance).toBeCloseTo(trackLength)
  })

  it('트랙은 상단에서 오른쪽, 오른쪽에서 아래로 진행해 시계 방향을 따른다', () => {
    const origin = pointOnTrack(0)
    const acrossTop = pointOnTrack(100)
    const downRight = pointOnTrack(1000)

    expect(acrossTop.x).toBeGreaterThan(origin.x)
    expect(acrossTop.y).toBe(origin.y)
    expect(downRight.y).toBeGreaterThan(origin.y)
  })

  it('선두와 ID tie-break를 따르되 사거리 안 알파를 우선한다', () => {
    const origin = pointOnTrack(0)
    const position = () => pointOnTrack(0)
    const normal1 = enemy({ id: 1, travelledDistance: 10 })
    const normal2 = enemy({ id: 2, travelledDistance: 20 })
    expect(chooseTarget([normal1, normal2], origin, 1, position)?.id).toBe(2)
    expect(chooseTarget([{ ...normal1, travelledDistance: 20 }, normal2], origin, 1, position)?.id).toBe(1)
    expect(chooseTarget([normal2, enemy({ id: 3, definitionId: 'alpha' })], origin, 1, position)?.id).toBe(3)
    expect(chooseTarget([normal2, enemy({ id: 3, definitionId: 'alpha', trackDistance: trackLength / 2 })], origin, 1, (candidate) => pointOnTrack(candidate.trackDistance))?.id).toBe(2)
  })

  it('죽은 target의 투사체는 소멸하고 재타기팅하지 않는다', () => {
    const run = createInitialState(1).run
    const next = moveProjectiles({
      ...run,
      enemies: [enemy({ id: 2 })],
      projectiles: [{ id: 1, sourceId: 1, targetId: 1, kind: 'basic', damage: 10, speed: 900, delay: 0, position: pointOnTrack(0) }],
    }, simulationContext, 1 / 60)
    expect(next.projectiles).toHaveLength(0)
    expect(next.enemies[0].hp).toBe(90)
  })

  it('아디나 범위 피해는 도착 위치 반경 안의 적에게 같은 피해를 준다', () => {
    const run = createInitialState(1).run
    const next = moveProjectiles({
      ...run,
      enemies: [enemy({ id: 1, hp: 100, maxHp: 100 }), enemy({ id: 2, hp: 100, maxHp: 100, trackDistance: 40 }), enemy({ id: 3, hp: 100, maxHp: 100, trackDistance: 200 })],
      projectiles: [{ id: 1, sourceId: 1, targetId: 1, kind: 'skill', damage: 24, speed: 900, delay: 0, areaRadius: 90, position: pointOnTrack(0) }],
    }, simulationContext, 1 / 60)
    expect(next.enemies.map((candidate) => candidate.hp)).toEqual([76, 76, 100])
  })

  it('같은 step에 도착한 아디나 범위 공격은 앞선 적중이 최초 대상을 처치해도 이미 생성된 범위 적중을 처리한다', () => {
    const run = createInitialState(1).run
    const next = moveProjectiles({
      ...run,
      enemies: [enemy({ id: 1, hp: 20, maxHp: 20 }), enemy({ id: 2, hp: 100, maxHp: 100, trackDistance: 40 })],
      projectiles: [
        { id: 1, sourceId: 1, targetId: 1, kind: 'basic', damage: 20, speed: 900, delay: 0, position: pointOnTrack(0) },
        { id: 2, sourceId: 2, targetId: 1, kind: 'skill', damage: 24, speed: 900, delay: 0, areaRadius: 90, position: pointOnTrack(0) },
      ],
    }, simulationContext, 1 / 60)

    expect(next.enemies.find((candidate) => candidate.id === 1)).toMatchObject({ hp: 0, dead: true })
    expect(next.enemies.find((candidate) => candidate.id === 2)?.hp).toBe(76)
  })
})

describe('카드·라운드·결과 명세', () => {
  it('선택한 규칙은 다시 나오지 않고 장착 가능 실험체가 없으면 아이템을 제외한다', () => {
    const run = createInitialState(12).run
    const offered = offerCards({ ...run, activeRuleEffects: ['outer-tactics'], units: [unit({ item: 'radar' })] }, simulationContext)
    expect(offered.cardOffer).not.toContain('outer-tactics')
    expect(offered.cardOffer.every((card) => ['free-clone', 'inner-tactics'].includes(card))).toBe(true)
  })

  it('리롤은 횟수를 차감하고 카드 적용은 round 6 전투로 전이한다', () => {
    const initial = createInitialState(12)
    let state = { ...initial, run: offerCards({ ...initial.run, phase: 'combat', units: [unit()] }, simulationContext) }
    state = gameReducer(state, { type: 'REROLL_CARDS' })
    expect(state.run.rerolls).toBe(2)
    const rule = state.run.cardOffer.find((card) => ['free-clone', 'outer-tactics', 'inner-tactics'].includes(card))
    expect(rule).toBeDefined()
    state = gameReducer(state, { type: 'CHOOSE_CARD', cardId: rule! })
    expect(state.run).toMatchObject({ phase: 'combat', round: { number: 6 }, cardOffer: [] })
  })

  it('아이템은 대상을 확정한 뒤 round 6으로 가며 다시 선택할 수 없다', () => {
    const initial = createInitialState(12)
    let state: GameStoreState = { ...initial, run: { ...initial.run, phase: 'card-selection', units: [unit()], cardOffer: ['radar'] } }
    state = gameReducer(state, { type: 'CHOOSE_CARD', cardId: 'radar' })
    expect(state.run.phase).toBe('item-targeting')
    state = gameReducer(state, { type: 'EQUIP_PENDING_ITEM', unitId: 1 })
    expect(state.run).toMatchObject({ phase: 'combat', round: { number: 6 } })
    expect(state.run.units[0].item).toBe('radar')
  })

  it('자유 복제는 기존 무료권에 3회를 합산한다', () => {
    const initial = createInitialState(12)
    const state: GameStoreState = { ...initial, run: { ...initial.run, phase: 'card-selection', freeCloneTickets: 2, cardOffer: ['free-clone'] } }
    const next = gameReducer(state, { type: 'CHOOSE_CARD', cardId: 'free-clone' })

    expect(next.run).toMatchObject({ phase: 'combat', freeCloneTickets: 5, round: { number: 6 } })
  })

  it('알파 처치와 timeout이 같은 step이면 승리하고 생존 시 timeout 패배한다', () => {
    const initial = createInitialState(1)
    const alpha = enemy({ definitionId: 'alpha', hp: 10, maxHp: 3200 })
    const boss = { ...initial.run, phase: 'combat' as const, round: { number: 10, kind: 'boss' as const, remaining: 1 / 60, started: true, spawnElapsed: 0, spawned: 1, total: 1 }, enemies: [alpha], pendingSpawns: 0 }
    const winning = gameReducer({ ...initial, run: { ...boss, projectiles: [{ id: 1, sourceId: 1, targetId: 1, kind: 'skill', damage: 10, speed: 900, delay: 0, position: pointOnTrack(0) }] } }, { type: 'TICK', delta: 1 / 60 })
    expect(winning.run).toMatchObject({ phase: 'victory', result: 'alpha' })
    const losing = gameReducer({ ...initial, run: boss }, { type: 'TICK', delta: 1 / 60 })
    expect(losing.run).toMatchObject({ phase: 'defeat', result: 'timeout' })
  })

  it('reset은 런·알림·엔티티를 완전한 초기 상태로 되돌린다', () => {
    let state = gameReducer(createInitialState(3), { type: 'CLONE_UNIT' })
    state = gameReducer(state, { type: 'RESET_RUN', seed: 77 })
    expect(state).toEqual(createInitialState(77))
  })
})
