import type { BoardUnitViewModel } from '../../game/application/selectors/board-selectors'

export const RangeIndicator = ({ unit }: { unit?: BoardUnitViewModel }) => {
  if (!unit) return null
  return <circle className="range-indicator" cx={unit.centerX} cy={unit.centerY} r={unit.rangeRadius} aria-hidden="true" />
}
