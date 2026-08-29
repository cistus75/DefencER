import type { UnitInstance } from '../../game/domain/unit'
import { unitDefinitions } from '../../game/config/unit-definitions'
export const ItemTargetPicker=({units,onPick}:{units:UnitInstance[];onPick:(id:number)=>void})=><div className="item-target-picker"><p>장착할 실험체를 선택하십시오</p>{units.map(unit=><button key={unit.id} disabled={Boolean(unit.item)} onClick={()=>onPick(unit.id)}>{unitDefinitions[unit.definitionId].name} · {unit.star}성 {unit.item?'장착 완료':''}</button>)}</div>
