import type { BoardUnitViewModel, PlacementSlotViewModel } from '../../game/application/selectors/board-selectors'
import { RangeIndicator } from './RangeIndicator'
import { UnitActor } from './UnitActor'

type DropPreview = 'move' | 'merge' | 'swap' | 'invalid'
const previewFor = (source: BoardUnitViewModel | undefined, target: BoardUnitViewModel | undefined, targetSlot: number): DropPreview | undefined => !source ? undefined : source.slot === targetSlot ? 'invalid' : !target ? 'move' : source.definitionId === target.definitionId && source.star === target.star && source.star < 5 ? 'merge' : 'swap'

export function PlacementBoard({ slots, units, selectedId, canInteract, dragSourceSlot, dragTargetSlot, onSelect, onDragStart, onDragTarget, onDragEnd, onDrop }: { slots: PlacementSlotViewModel[]; units: BoardUnitViewModel[]; selectedId?: number; canInteract: boolean; dragSourceSlot?: number; dragTargetSlot?: number; onSelect: (id: number) => void; onDragStart: (slot: number) => void; onDragTarget: (slot?: number) => void; onDragEnd: () => void; onDrop: (sourceSlot: number, targetSlot: number) => void }) {
  const bySlot = new Map(units.map((unit) => [unit.slot, unit]))
  const selectedUnit = units.find((unit) => unit.id === selectedId)
  const dragSource = dragSourceSlot === undefined ? undefined : bySlot.get(dragSourceSlot)
  return (
    <svg className="placement-board" viewBox="0 0 1374 1145" preserveAspectRatio="xMidYMid slice" role="grid" aria-label="실험체 배치판 4행 5열">
      <RangeIndicator unit={selectedUnit} />
      {slots.map(({ slot, x, y, points }) => {
        const unit = bySlot.get(slot)
        const isSelected = unit !== undefined && unit.id === selectedId
        const preview = dragTargetSlot === slot ? previewFor(dragSource, unit, slot) : undefined
        return (
          <g key={slot} className={`placement-slot ${isSelected ? 'placement-slot--selected' : ''} ${preview ? `placement-slot--drop-${preview}` : ''}`} role="gridcell" tabIndex={0} aria-selected={isSelected} aria-label={unit ? `${unit.name} ${unit.star}성 슬롯 ${slot + 1}` : `빈 배치 슬롯 ${slot + 1}`} onDragOver={(event) => { if (canInteract) { event.preventDefault(); onDragTarget(slot) } }} onDragLeave={() => { if (dragTargetSlot === slot) onDragTarget(undefined) }} onDrop={(event) => { event.preventDefault(); if (!canInteract) return; const source = Number(event.dataTransfer.getData('slot')); if (Number.isInteger(source)) onDrop(source, slot); onDragEnd() }} onClick={() => { if (unit) onSelect(unit.id) }} onKeyDown={(event) => { if (event.key !== 'Enter' && event.key !== ' ') return; event.preventDefault(); if (canInteract && selectedUnit && selectedUnit.slot !== slot) onDrop(selectedUnit.slot, slot); else if (unit) onSelect(unit.id) }}>
            <polygon className="placement-slot__surface" points={points} />
            {unit && <foreignObject className="slot-unit" x={x} y={y} width="126" height="108"><UnitActor unit={unit} canDrag={canInteract} onSelect={onSelect} onDragStart={onDragStart} onDragEnd={onDragEnd} /></foreignObject>}
          </g>
        )
      })}
    </svg>
  )
}
