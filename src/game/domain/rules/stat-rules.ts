import type { UnitDefinition } from '../unit'
import { isOuterSlot } from './board-rules'
const starMultiplier = [0, 1, 1.85, 3.4, 6.2, 11.2]
export const effectiveAttack = (definition: UnitDefinition, star: number, item?: string, rules: string[] = [], slot = 0) => {
  let value = definition.attack * starMultiplier[star]
  if (item === 'power-module') value *= 1.2
  if (rules.includes('outer-tactics')) value *= isOuterSlot(slot) ? 1.2 : .65
  if (rules.includes('inner-tactics')) value *= isOuterSlot(slot) ? .4 : 2.5
  if (rules.includes('concentrated-fire')) value *= 1.15
  return value
}
export const effectiveRange = (definition: UnitDefinition, item?: string, rules: string[] = []) => definition.range * (item === 'radar' ? 1.2 : 1) * (rules.includes('extended-sensors') ? 1.12 : 1)
export const effectiveAps = (definition: UnitDefinition, item?: string, rules: string[] = []) => definition.attacksPerSecond * (item === 'cube-watch' ? 1.18 : 1) * (rules.includes('rapid-cycle') ? 1.15 : 1)
