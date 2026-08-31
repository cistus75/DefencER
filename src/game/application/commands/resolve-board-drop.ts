import { effectiveAps } from '../../domain/rules/stat-rules'
import type { UnitInstance } from '../../domain/unit'
import type { GameStoreState } from '../game-store-state'
import { enqueueNotification } from '../notification'
import type { SimulationContext } from '../../simulation/simulation-context'

export const resolveBoardDrop = (state: GameStoreState, sourceSlot: number, targetSlot: number, context: SimulationContext): GameStoreState => {
  if (sourceSlot === targetSlot) return state
  const source = state.run.units.find((unit) => unit.slot === sourceSlot)
  const target = state.run.units.find((unit) => unit.slot === targetSlot)
  if (!source) return state
  const lock = state.run.phase === 'combat' ? 0.75 : 0

  if (!target) {
    const units = state.run.units.map((unit) => unit.id === source.id ? { ...unit, slot: targetSlot, actionLock: lock } : unit)
    return enqueueNotification(withUnits(state, units), 'unit-moved')
  }
  if (source.definitionId === target.definitionId && source.star === target.star && source.star < 5) {
    const definition = context.config.units[target.definitionId]
    const units = state.run.units
      .filter((unit) => unit.id !== source.id)
      .map((unit) => unit.id === target.id ? {
        ...unit,
        star: (unit.star + 1) as UnitInstance['star'],
        attackCooldown: Math.min(unit.attackCooldown, 1 / effectiveAps(definition, unit.item)),
        skillCooldown: Math.min(unit.skillCooldown, definition.skillCooldown),
      } : unit)
    return enqueueNotification(withUnits(state, units), 'units-merged', { unitName: definition.name, star: target.star + 1 })
  }
  const units = state.run.units.map((unit) => unit.id === source.id
    ? { ...unit, slot: targetSlot, actionLock: lock }
    : unit.id === target.id
      ? { ...unit, slot: sourceSlot, actionLock: lock }
      : unit)
  return enqueueNotification(withUnits(state, units), 'units-swapped')
}

const withUnits = (state: GameStoreState, units: UnitInstance[]): GameStoreState => ({ ...state, run: { ...state.run, units } })
