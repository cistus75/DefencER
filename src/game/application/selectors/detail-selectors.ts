import type { RunState } from '../../domain/run-state'
export const selectedUnitViewModel=(run:RunState,id?:number)=>id===undefined?undefined:run.units.find(unit=>unit.id===id)
