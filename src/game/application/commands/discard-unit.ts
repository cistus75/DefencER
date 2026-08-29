import type { GameStoreState } from '../game-store-state'
import { unitDefinitions } from '../../config/unit-definitions'
import { notificationMessage } from '../notification'
export const discardUnit=(state:GameStoreState,unitId:number):GameStoreState=>{const unit=state.run.units.find(u=>u.id===unitId); if(!unit)return state; const code=unit.item?'item-equipped':unit.star===5?'max-star':'unit-discarded'; return code==='unit-discarded'?{...state,run:{...state.run,units:state.run.units.filter(u=>u.id!==unitId)},notifications:[...state.notifications,{id:Date.now(),code,message:notificationMessage(code,{unitName:unitDefinitions[unit.definitionId].name})}]}:{...state,notifications:[...state.notifications,{id:Date.now(),code,message:notificationMessage(code)}]}}
