import type { SimulationContext } from '../../simulation/simulation-context'
import type { GameStoreState } from '../game-store-state'
import { enqueueNotification } from '../notification'

export const discardUnit = (state: GameStoreState, unitId: number, context: SimulationContext): GameStoreState => {
  const unit = state.run.units.find((candidate) => candidate.id === unitId)
  if (!unit) return state
  if (unit.item) return enqueueNotification(state, 'item-equipped')
  if (unit.star === 5) return enqueueNotification(state, 'max-star')
  return enqueueNotification({ ...state, run: { ...state.run, units: state.run.units.filter((candidate) => candidate.id !== unitId) } }, 'unit-discarded', { unitName: context.config.units[unit.definitionId].name })
}
