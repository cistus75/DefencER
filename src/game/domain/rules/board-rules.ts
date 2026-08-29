import type { Slot } from '../common'
import type { UnitInstance } from '../unit'
export const OUTER_SLOTS: Slot[] = [0,1,2,3,4,5,9,10,14,15,16,17,18,19]
export const INNER_SLOTS: Slot[] = [6,7,8,11,12,13]
export const firstEmptySlot = (units: UnitInstance[]): Slot | undefined => Array.from({ length: 20 }, (_, slot) => slot).find((slot) => !units.some((unit) => unit.slot === slot))
export const isOuterSlot = (slot: Slot) => OUTER_SLOTS.includes(slot)
