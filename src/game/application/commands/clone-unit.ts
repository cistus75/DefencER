import type { UnitDefinitionId } from '../../domain/common'
import { firstEmptySlot } from '../../domain/rules/board-rules'
import { cloneCost } from '../../domain/rules/economy-rules'
import type { SimulationContext } from '../../simulation/simulation-context'
import type { GameStoreState } from '../game-store-state'
import { enqueueNotification } from '../notification'

const cloneCandidates: UnitDefinitionId[] = ['hyunwoo', 'rio', 'adina', 'leni']

export const cloneUnit = (state: GameStoreState, context: SimulationContext): GameStoreState => {
  const { run } = state
  const slot = firstEmptySlot(run.units)
  if (slot === undefined) return enqueueNotification(state, 'no-empty-slot')
  const cost = cloneCost(run.successfulCloneCount)
  if (run.freeCloneTickets === 0 && run.credits < cost) return enqueueNotification(state, 'insufficient-credits')

  const random = context.random.next(run.randomSeed)
  const definitionId = cloneCandidates[Math.floor(random.value * cloneCandidates.length)]
  const id = run.entityCounters.unit + 1
  const next = {
    ...state,
    run: {
      ...run,
      units: [...run.units, { id, definitionId, slot, star: 1 as const, attackCooldown: 0, skillCooldown: context.config.units[definitionId].skillCooldown, actionLock: run.phase === 'combat' ? 0.75 : 0, marks: [] }],
      randomSeed: random.seed,
      credits: run.freeCloneTickets > 0 ? run.credits : run.credits - cost,
      freeCloneTickets: Math.max(0, run.freeCloneTickets - 1),
      successfulCloneCount: run.successfulCloneCount + 1,
      entityCounters: { ...run.entityCounters, unit: id },
    },
  }
  return enqueueNotification(next, 'clone-succeeded', { unitName: context.config.units[definitionId].name, slot: slot + 1 })
}
