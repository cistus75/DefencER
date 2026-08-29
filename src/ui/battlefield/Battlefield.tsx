import type { UnitInstance } from '../../game/domain/unit'
import type { EnemyInstance } from '../../game/domain/enemy'
import type { Projectile } from '../../game/domain/projectile'
import { PlacementBoard } from './PlacementBoard'
import { EnemyLayer } from './EnemyLayer'
import { ProjectileLayer } from './ProjectileLayer'
export function Battlefield(props:{units:UnitInstance[];enemies:EnemyInstance[];projectiles:Projectile[];selectedId?:number;onSelect:(id:number)=>void;onDrop:(a:number,b:number)=>void}){return <div className="battlefield"><img className="battlefield-art" src="/back.png" alt="연구시설 중앙 전장"/><div className="battlefield-shade"/><EnemyLayer enemies={props.enemies}/><ProjectileLayer projectiles={props.projectiles}/><PlacementBoard units={props.units} selectedId={props.selectedId} onSelect={props.onSelect} onDrop={props.onDrop}/></div>}
