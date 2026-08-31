import type { Projectile } from '../domain/projectile'
import type { RunState } from '../domain/run-state'
import type { SupportMark } from '../domain/unit'
import type { SimulationContext } from './simulation-context'

export const combinedSupportRatio = (marks: SupportMark[]) => Math.min(
  0.8,
  marks.reduce((product, mark) => product * (1 + mark.ratio), 1) - 1,
)

export const resolveSupportOnBasicHit = (
  run: RunState,
  projectile: Projectile,
  context: SimulationContext,
): RunState => {
  if (projectile.kind !== 'basic') return run
  const source = run.units.find((unit) => unit.id === projectile.sourceId)
  if (!source || source.marks.length === 0) return run

  const ratio = combinedSupportRatio(source.marks)
  if (ratio <= 0) return run
  const supportingLeniIds = [...new Set(source.marks.map((mark) => mark.sourceId))].sort((left, right) => left - right)
  const id = run.entityCounters.projectile + 1

  return {
    ...run,
    units: run.units.map((unit) => supportingLeniIds.includes(unit.id)
      ? { ...unit, skillCooldown: Math.max(0, unit.skillCooldown - 0.25) }
      : unit),
    projectiles: [...run.projectiles, {
      id,
      sourceId: source.id,
      targetId: projectile.targetId,
      kind: 'support',
      damage: projectile.damage * ratio,
      speed: context.config.balance.supportProjectileSpeed,
      delay: 0,
      position: context.config.battlefield.slotCenter(source.slot),
      supports: supportingLeniIds,
    }],
    entityCounters: { ...run.entityCounters, projectile: id },
  }
}
