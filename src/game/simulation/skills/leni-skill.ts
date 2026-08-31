import { effectiveRange } from '../../domain/rules/stat-rules'
import type { SkillHandler } from './skill-handler'
import { inactiveSkill } from './skill-handler'

const supportRatioByStar = [0, 0.2, 0.24, 0.28, 0.32, 0.468]

export const leniSkill: SkillHandler = (input) => {
  const sourcePoint = input.context.config.battlefield.slotCenter(input.unit.slot)
  const range = effectiveRange(input.definition, input.unit.item) * input.context.config.balance.rangePixels
  const candidates = input.units.filter((candidate) => {
    const targetPoint = input.context.config.battlefield.slotCenter(candidate.slot)
    return candidate.id !== input.unit.id && input.context.config.units[candidate.definitionId].role !== '서포터' && Math.hypot(targetPoint.x - sourcePoint.x, targetPoint.y - sourcePoint.y) <= range
  })
  if (candidates.length === 0) return inactiveSkill(input)
  const random = input.context.random.next(input.randomSeed)
  const target = candidates[Math.floor(random.value * candidates.length)]
  return {
    units: input.units.map((candidate) => candidate.id === target.id ? { ...candidate, marks: [...candidate.marks, { sourceId: input.unit.id, remaining: 4, ratio: supportRatioByStar[input.unit.star] }] } : candidate),
    projectiles: [], projectileCounter: input.projectileCounter, randomSeed: random.seed, activated: true,
  }
}
