import type { CSSProperties } from 'react'
import type { BoardUnitViewModel } from '../../game/application/selectors/board-selectors'

export function UnitActor({ unit, canDrag, onSelect, onDragStart, onDragEnd }: { unit: BoardUnitViewModel; canDrag: boolean; onSelect: (id: number) => void; onDragStart: (slot: number) => void; onDragEnd: () => void }) {
  return (
    <div className="slot-unit__content" draggable={canDrag} aria-disabled={!canDrag} onDragStart={(event) => { if (!canDrag) return; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('slot', String(unit.slot)); onDragStart(unit.slot) }} onDragEnd={onDragEnd} onClick={(event) => { event.stopPropagation(); onSelect(unit.id) }}>
      <div className="unit-badge" style={{ '--unit-color': unit.color } as CSSProperties}>
        <span className="unit-badge__level">{unit.star}★</span>
        {unit.markCount > 0 && <span className="unit-mark" title={`곰돌이 표식 ${unit.markCount}개`}>♥ {unit.markCount}</span>}
        <img className="unit-sd" src={unit.asset} alt={`${unit.name} SD`} draggable={false} />
        <strong>{unit.name}</strong>
        <div className="skill-progress skill-progress--unit" aria-hidden="true"><i style={{ width: `${unit.skillProgress * 100}%` }} /></div>
      </div>
    </div>
  )
}
