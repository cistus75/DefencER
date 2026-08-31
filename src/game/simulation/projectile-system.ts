import type { Vec2 } from '../domain/common'
import type { RunState } from '../domain/run-state'
import { resolveDamage, type ProjectileImpact } from './damage-resolution'
import { resolveSupportOnBasicHit } from './support-resolution'
import type { SimulationContext } from './simulation-context'

const moveToward = (from: Vec2, to: Vec2, distance: number): Vec2 => {
  const total = Math.hypot(to.x - from.x, to.y - from.y)
  if (total === 0) return to
  return { x: from.x + ((to.x - from.x) / total) * distance, y: from.y + ((to.y - from.y) / total) * distance }
}

export const advanceProjectiles = (input: RunState, context: SimulationContext, delta: number): { run: RunState; impacts: ProjectileImpact[] } => {
  let run = { ...input, projectiles: [...input.projectiles] }
  const impacts: ProjectileImpact[] = []
  for (const projectileId of [...run.projectiles].sort((left, right) => left.id - right.id).map((projectile) => projectile.id)) {
    const projectile = run.projectiles.find((current) => current.id === projectileId)
    if (!projectile || projectile.delay > 0) continue
    const target = run.enemies.find((enemy) => enemy.id === projectile.targetId && !enemy.dead)
    if (!target) {
      run = { ...run, projectiles: run.projectiles.filter((current) => current.id !== projectile.id) }
      continue
    }
    const targetPoint = context.config.battlefield.pointOnTrack(target.trackDistance)
    const remaining = Math.hypot(targetPoint.x - projectile.position.x, targetPoint.y - projectile.position.y)
    if (remaining > projectile.speed * delta) {
      run = { ...run, projectiles: run.projectiles.map((current) => current.id === projectile.id ? { ...current, position: moveToward(current.position, targetPoint, current.speed * delta) } : current) }
      continue
    }
    const hitIds = projectile.areaRadius === undefined
      ? [target.id]
      : run.enemies.filter((enemy) => { const position = context.config.battlefield.pointOnTrack(enemy.trackDistance); return !enemy.dead && Math.hypot(position.x - targetPoint.x, position.y - targetPoint.y) <= projectile.areaRadius! }).map((enemy) => enemy.id)
    impacts.push({ projectile, targetPoint, hitIds })
    run = { ...run, projectiles: run.projectiles.filter((current) => current.id !== projectile.id) }
  }
  return { run, impacts }
}

export const moveProjectiles = (input: RunState, context: SimulationContext, delta: number): RunState => {
  const advanced = advanceProjectiles(input, context, delta)
  const damaged = resolveDamage(advanced.run, advanced.impacts)
  return damaged.basicHits.reduce((run, projectile) => resolveSupportOnBasicHit(run, projectile, context), damaged.run)
}
