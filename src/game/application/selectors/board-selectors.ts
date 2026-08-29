import type { RunState } from '../../domain/run-state'
export const unitAtSlot=(run:RunState,slot:number)=>run.units.find(unit=>unit.slot===slot)
