import type { GameStoreState } from '../game-store-state'
import { firstEmptySlot } from '../../domain/rules/board-rules'
import { cloneCost } from '../../domain/rules/economy-rules'
import { seededRandomGenerator } from '../../infrastructure/seeded-random-generator'
import { unitDefinitions } from '../../config/unit-definitions'
import { notificationMessage } from '../notification'
import type { UnitDefinitionId } from '../../domain/common'
export const cloneUnit = (state: GameStoreState): GameStoreState => {
  const run = state.run
  const slot = firstEmptySlot(run.units)
  if (slot === undefined) return add(state, 'no-empty-slot')
  const cost = cloneCost(run.successfulCloneCount)
  if (!run.freeCloneTickets && run.credits < cost) return add(state, 'insufficient-credits')
  const random = seededRandomGenerator.next(run.randomSeed)
  const ids: UnitDefinitionId[] = ['hyunwoo', 'rio', 'adina', 'leni']
  const definitionId = ids[Math.floor(random.value * 4)]
  const id = run.entityCounters.unit + 1
  const units = [...run.units, { id, definitionId, slot, star: 1 as const, attackCooldown: 0, skillCooldown: unitDefinitions[definitionId].skillCooldown, actionLock: run.phase === 'combat' ? .75 : 0, marks: [] }]
  return { run: { ...run, units, randomSeed: random.seed, credits: run.freeCloneTickets ? run.credits : run.credits - cost, freeCloneTickets: run.freeCloneTickets ? run.freeCloneTickets - 1 : 0, successfulCloneCount: run.successfulCloneCount + 1, entityCounters: { ...run.entityCounters, unit: id } }, notifications: [...state.notifications, { id, code: 'clone-succeeded' as const, message: notificationMessage('clone-succeeded', { unitName: unitDefinitions[definitionId].name, slot: slot + 1 }) }].slice(-5) }
}
const add=(state:GameStoreState,code:'no-empty-slot'|'insufficient-credits'):GameStoreState=>({...state,notifications:[...state.notifications,{id:state.notifications.length+1,code,message:notificationMessage(code)}].slice(-5)})
