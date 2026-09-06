import type { CSSProperties } from 'react'
import type { BoardUnitViewModel } from '../../game/application/selectors/board-selectors'

export function UnitActor({ unit, canDrag, onSelect, onDragStart, onDragEnd }: { unit: BoardUnitViewModel; canDrag: boolean; onSelect: (id: number) => void; onDragStart: (slot: number) => void; onDragEnd: () => void }) {
  return (
    <div className="slot-unit__content" draggable={canDrag} aria-disabled={!canDrag} onDragStart={(event) => { if (!canDrag) return; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('application/x-defencer-slot', String(unit.slot)); onDragStart(unit.slot) }} onDragEnd={onDragEnd} onClick={(event) => { event.stopPropagation(); onSelect(unit.id) }}>
      <div className={`unit-badge ${unit.actionLock > 0 ? 'unit-badge--locked' : ''} ${unit.attackCooldown <= 0 ? 'unit-badge--ready' : ''}`} style={{ '--unit-color': unit.color } as CSSProperties}>
        <span className="unit-badge__level">{unit.star}★</span>
        {unit.markCount > 0 && <span className="unit-mark" title={`곰돌이 표식 ${unit.markCount}개`}>♥ {unit.markCount} · {Math.ceil(Math.min(...unit.markDurations))}초</span>}
        <img className="unit-sd" src={unit.asset} alt={`${unit.name} SD`} draggable={false} />
        <strong>{unit.name}</strong>
        <div className="skill-progress skill-progress--unit" aria-hidden="true"><i style={{ width: `${unit.skillProgress * 100}%` }} /></div>
        {unit.actionLock > 0 && <small className="unit-action-state">재배치 잠금</small>}
      </div>
    </div>
  )
}
