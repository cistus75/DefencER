import type { UnitDefinition } from '../unit'
import { isOuterSlot } from './board-rules'
const starMultiplier = [0, 1, 1.2, 1.4, 1.6, 1.8]
export const effectiveAttack = (definition: UnitDefinition, star: number, item?: string, rules: string[] = [], slot = 0) => {
  let value = definition.attack * starMultiplier[star] * (star === 5 ? 1.3 : 1)
  if (item === 'power-module') value *= 1.2
  if (rules.includes('outer-tactics')) value *= isOuterSlot(slot) ? 1.2 : .85
  if (rules.includes('inner-tactics')) value *= isOuterSlot(slot) ? .9 : 1.25
  return value
}
export const effectiveRange = (definition: UnitDefinition, item?: string) => definition.range * (item === 'radar' ? 1.2 : 1)
export const effectiveAps = (definition: UnitDefinition, item?: string) => definition.attacksPerSecond * (item === 'cube-watch' ? 1.18 : 1)
