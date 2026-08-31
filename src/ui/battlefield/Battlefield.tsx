import type { BoardUnitViewModel, EnemyActorViewModel, PlacementSlotViewModel, ProjectileActorViewModel } from '../../game/application/selectors/board-selectors'
import { EnemyLayer } from './EnemyLayer'
import { PlacementBoard } from './PlacementBoard'
import { ProjectileLayer } from './ProjectileLayer'

export function Battlefield(props: { slots: PlacementSlotViewModel[]; units: BoardUnitViewModel[]; enemies: EnemyActorViewModel[]; projectiles: ProjectileActorViewModel[]; selectedId?: number; canInteract: boolean; dragSourceSlot?: number; dragTargetSlot?: number; onSelect: (id: number) => void; onDragStart: (slot: number) => void; onDragTarget: (slot?: number) => void; onDragEnd: () => void; onDrop: (sourceSlot: number, targetSlot: number) => void }) {
  return <div className="battlefield" aria-label="중앙 전장"><img className="battlefield-art" src="/back.png" alt="연구시설 중앙 전장" /><div className="battlefield-shade" /><EnemyLayer enemies={props.enemies} /><ProjectileLayer projectiles={props.projectiles} /><PlacementBoard {...props} /></div>
}
