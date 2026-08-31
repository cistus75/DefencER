import type { RunState } from '../domain/run-state'
import { resolveDamage } from './damage-resolution'
import { moveEnemies } from './enemy-movement-system'
import { advanceProjectiles } from './projectile-system'
import { resolveRound } from './round-resolution-system'
import type { SimulationContext } from './simulation-context'
import { spawnEnemies } from './spawn-system'
import { resolveSupportOnBasicHit } from './support-resolution'
import { actUnits } from './unit-action-system'

export const stepCombat = (input: RunState, context: SimulationContext, delta = context.config.balance.fixedStep): RunState => {
  let run = {
    ...input,
    round: { ...input.round, remaining: Math.max(0, input.round.remaining - delta) },
    units: input.units.map((unit) => ({ ...unit, actionLock: Math.max(0, unit.actionLock - delta), attackCooldown: Math.max(0, unit.attackCooldown - delta), skillCooldown: Math.max(0, unit.skillCooldown - delta), marks: unit.marks.map((mark) => ({ ...mark, remaining: Math.max(0, mark.remaining - delta) })).filter((mark) => mark.remaining > 0) })),
    projectiles: input.projectiles.map((projectile) => ({ ...projectile, delay: Math.max(0, projectile.delay - delta) })),
  }
  run = spawnEnemies(run, context, delta)
  if (run.enemies.length >= 50) return { ...run, phase: 'defeat', result: 'overflow' }
  run = moveEnemies(run, context, delta)
  run = actUnits(run, context)
  const advanced = advanceProjectiles(run, context, delta)
  const damaged = resolveDamage(advanced.run, advanced.impacts)
  run = damaged.basicHits.reduce((current, projectile) => resolveSupportOnBasicHit(current, projectile, context), damaged.run)
  return resolveRound(run, context)
}
