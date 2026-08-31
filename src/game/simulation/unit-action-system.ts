import type { RunState } from '../domain/run-state'
import { effectiveAps, effectiveAttack, effectiveRange } from '../domain/rules/stat-rules'
import { chooseTarget } from '../domain/rules/targeting-rules'
import { skillRegistry } from './skills/skill-registry'
import type { SimulationContext } from './simulation-context'

export const actUnits = (run: RunState, context: SimulationContext): RunState => {
  let units = [...run.units].sort((left, right) => left.id - right.id).map((unit) => ({ ...unit, marks: [...unit.marks] }))
  let projectiles = [...run.projectiles]
  let projectileCounter = run.entityCounters.projectile
  let randomSeed = run.randomSeed

  for (const unitId of units.map((unit) => unit.id)) {
    let unitIndex = units.findIndex((unit) => unit.id === unitId)
    let unit = units[unitIndex]
    if (unit.actionLock > 0) continue
    const definition = context.config.units[unit.definitionId]
    const origin = context.config.battlefield.slotCenter(unit.slot)
    const target = chooseTarget(run.enemies, origin, effectiveRange(definition, unit.item), (candidate) => context.config.battlefield.pointOnTrack(candidate.trackDistance), context.config.balance.rangePixels)
    const attack = effectiveAttack(definition, unit.star, unit.item, run.activeRuleEffects, unit.slot)

    if (unit.skillCooldown === 0) {
      const result = skillRegistry[definition.skillId]({ run, context, units, unit, definition, target, attack, origin, projectileCounter, randomSeed })
      units = result.units
      projectiles.push(...result.projectiles)
      projectileCounter = result.projectileCounter
      randomSeed = result.randomSeed
      unitIndex = units.findIndex((candidate) => candidate.id === unitId)
      unit = units[unitIndex]
      if (result.activated) {
        unit = { ...unit, skillCooldown: definition.skillCooldown }
        units[unitIndex] = unit
      }
    }

    if (target && unit.attackCooldown === 0) {
      projectileCounter += 1
      projectiles.push({ id: projectileCounter, sourceId: unit.id, targetId: target.id, kind: 'basic', damage: attack, speed: definition.projectileSpeed, delay: 0, position: origin })
      units[unitIndex] = { ...unit, attackCooldown: 1 / effectiveAps(definition, unit.item) }
    }
  }
  return { ...run, units, projectiles, randomSeed, entityCounters: { ...run.entityCounters, projectile: projectileCounter } }
}
