import { describe, expect, it } from 'vitest'
import { createInitialState } from '../game/application/create-initial-state'
import { pointOnTrack } from '../game/config/battlefield-config'
import type { UnitDefinitionId } from '../game/domain/common'
import type { UnitInstance } from '../game/domain/unit'
import { moveProjectiles } from '../game/simulation/projectile-system'
import { stepCombat } from '../game/simulation/step-combat'
import { actUnits } from '../game/simulation/unit-action-system'
import { simulationContext } from './state-builders'

const combatUnit = (definitionId: UnitDefinitionId): UnitInstance => ({ id: 1, definitionId, slot: 0, star: 1, attackCooldown: 0, skillCooldown: 0, actionLock: 0, marks: [] })
const target = { id: 1, definitionId: 'normal' as const, hp: 500, maxHp: 500, trackDistance: 0, travelledDistance: 0 }

describe('네 실험체 전투 행동', () => {
  it('현우는 스킬 200%와 기본 공격을 같은 step에 각각 snapshot한다', () => {
    const run = createInitialState(1).run
    const next = actUnits({ ...run, phase: 'combat', units: [combatUnit('hyunwoo')], enemies: [target] }, simulationContext)
    expect(next.projectiles.map((projectile) => ({ kind: projectile.kind, damage: projectile.damage }))).toEqual([{ kind: 'skill', damage: 68 }, { kind: 'basic', damage: 34 }])
    expect(next.units[0]).toMatchObject({ skillCooldown: 4, attackCooldown: 1 })
  })

  it('리오는 75% 3발을 0/0.12/0.24초 delay로 만들고 기본 공격도 수행한다', () => {
    const run = createInitialState(1).run
    const next = actUnits({ ...run, phase: 'combat', units: [combatUnit('rio')], enemies: [target] }, simulationContext)
    expect(next.projectiles.slice(0, 3).map((projectile) => ({ damage: projectile.damage, delay: projectile.delay }))).toEqual([{ damage: 13.5, delay: 0 }, { damage: 13.5, delay: 0.12 }, { damage: 13.5, delay: 0.24 }])
    expect(next.projectiles[3]).toMatchObject({ kind: 'basic', damage: 18 })
  })

  it('아디나는 240%·반경 90 범위 스킬과 기본 공격을 만든다', () => {
    const run = createInitialState(1).run
    const next = actUnits({ ...run, phase: 'combat', units: [combatUnit('adina')], enemies: [target] }, simulationContext)
    expect(next.projectiles[0]).toMatchObject({ kind: 'skill', damage: 24, areaRadius: 90 })
    expect(next.projectiles[1]).toMatchObject({ kind: 'basic', damage: 10 })
  })

  it('대상이 없으면 기본 공격과 비레니 스킬 cooldown을 소비하지 않는다', () => {
    const run = createInitialState(1).run
    const next = actUnits({ ...run, phase: 'combat', units: [combatUnit('hyunwoo')] }, simulationContext)
    expect(next.units[0]).toMatchObject({ skillCooldown: 0, attackCooldown: 0 })
    expect(next.projectiles).toHaveLength(0)
  })

  it('레니는 유효 후보가 없으면 cooldown과 seed를 소비하지 않는다', () => {
    const run = createInitialState(77).run
    const next = actUnits({ ...run, phase: 'combat', units: [combatUnit('leni')] }, simulationContext)
    expect(next.units[0].skillCooldown).toBe(0)
    expect(next.randomSeed).toBe(77)
  })

  it('행동 잠금 중 cooldown은 감소하지만 스킬·기본 공격은 발동하지 않는다', () => {
    const run = createInitialState(1).run
    const locked = { ...combatUnit('hyunwoo'), actionLock: 0.75, attackCooldown: 0.5, skillCooldown: 0.5 }
    const next = stepCombat({ ...run, phase: 'combat', units: [locked], enemies: [target], pendingSpawns: 0 }, simulationContext, 1 / 60)
    expect(next.units[0].actionLock).toBeCloseTo(0.75 - 1 / 60)
    expect(next.units[0].attackCooldown).toBeCloseTo(0.5 - 1 / 60)
    expect(next.projectiles).toHaveLength(0)
  })

  it('지원 피해는 레니 표식을 재귀 발동하지 않는다', () => {
    const run = createInitialState(1).run
    const next = moveProjectiles({ ...run, units: [{ ...combatUnit('hyunwoo'), marks: [{ sourceId: 9, remaining: 4, ratio: 0.2 }] }], enemies: [target], projectiles: [{ id: 1, sourceId: 1, targetId: 1, kind: 'support', damage: 20, speed: 1100, delay: 0, position: pointOnTrack(0), supports: [9] }], entityCounters: { ...run.entityCounters, projectile: 1 } }, simulationContext, 1 / 60)
    expect(next.enemies[0].hp).toBe(480)
    expect(next.projectiles).toHaveLength(0)
    expect(next.entityCounters.projectile).toBe(1)
  })

  it('리오 첫 발이 target을 처치하면 같은 step의 나머지 발은 피해를 중복 적용하지 않는다', () => {
    const run = createInitialState(1).run
    const projectiles = [1, 2, 3].map((id) => ({ id, sourceId: 1, targetId: 1, kind: 'skill' as const, damage: 10, speed: 1000, delay: 0, position: pointOnTrack(0) }))
    const next = moveProjectiles({ ...run, enemies: [{ ...target, hp: 10 }], projectiles, entityCounters: { ...run.entityCounters, projectile: 3 } }, simulationContext, 1 / 60)
    expect(next.enemies[0].hp).toBe(0)
    expect(next.projectiles).toHaveLength(0)
  })
})
