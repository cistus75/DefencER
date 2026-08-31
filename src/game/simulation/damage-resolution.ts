import type { Vec2 } from '../domain/common'
import type { Projectile } from '../domain/projectile'
import type { RunState } from '../domain/run-state'

export type ProjectileImpact = { projectile: Projectile; targetPoint: Vec2; hitIds: number[] }
export type DamageResult = { run: RunState; basicHits: Projectile[] }

export const resolveDamage = (input: RunState, impacts: ProjectileImpact[]): DamageResult => {
  let run = input
  const basicHits: Projectile[] = []
  for (const impact of impacts) {
    let primaryWasHit = false
    run = {
      ...run,
      enemies: run.enemies.map((enemy) => {
        if (enemy.dead || !impact.hitIds.includes(enemy.id)) return enemy
        if (enemy.id === impact.projectile.targetId) primaryWasHit = true
        const hp = enemy.hp - impact.projectile.damage
        return { ...enemy, hp, dead: hp <= 0 }
      }),
    }
    if (primaryWasHit && impact.projectile.kind === 'basic') basicHits.push(impact.projectile)
  }
  return { run, basicHits }
}
