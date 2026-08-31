import type { SkillHandler } from './skill-handler'
import { inactiveSkill } from './skill-handler'

export const adinaSkill: SkillHandler = (input) => {
  if (!input.target) return inactiveSkill(input)
  const id = input.projectileCounter + 1
  return { units: input.units, projectiles: [{ id, sourceId: input.unit.id, targetId: input.target.id, kind: 'skill', damage: input.attack * 2.4, speed: input.definition.projectileSpeed, delay: 0, areaRadius: 90, position: input.origin }], projectileCounter: id, randomSeed: input.randomSeed, activated: true }
}
