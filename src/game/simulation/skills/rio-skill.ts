import type { SkillHandler } from './skill-handler'
import { inactiveSkill } from './skill-handler'

export const rioSkill: SkillHandler = (input) => {
  if (!input.target) return inactiveSkill(input)
  let counter = input.projectileCounter
  const projectiles = [0, 0.12, 0.24].map((delay) => ({ id: ++counter, sourceId: input.unit.id, targetId: input.target!.id, kind: 'skill' as const, damage: input.attack * 0.75, speed: input.definition.projectileSpeed, delay, position: input.origin }))
  return { units: input.units, projectiles, projectileCounter: counter, randomSeed: input.randomSeed, activated: true }
}
