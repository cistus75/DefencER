import { stepCombat } from '../../simulation/step-combat'
import type { SimulationContext } from '../../simulation/simulation-context'
import type { GameStoreState } from '../game-store-state'
import { enqueueNotification } from '../notification'

export const startRound = (state: GameStoreState, context: SimulationContext): GameStoreState => {
  const definition = context.config.roundDefinition(state.run.round.number)
  let run = { ...state.run, phase: 'combat' as const, round: { ...state.run.round, kind: definition.kind, remaining: definition.duration, started: true, total: definition.total }, pendingSpawns: definition.total }
  if (definition.kind === 'boss' && definition.bossId) {
    const id = run.entityCounters.enemy + 1
    const boss = context.config.enemies[definition.bossId]
    run = { ...run, pendingSpawns: 0, enemies: [...run.enemies, { id, definitionId: definition.bossId, hp: boss.hp, maxHp: boss.hp, trackDistance: 0, travelledDistance: 0 }], round: { ...run.round, spawned: 1 }, entityCounters: { ...run.entityCounters, enemy: id } }
  }
  return { ...state, run }
}

export const tickCombat = (state: GameStoreState, delta: number, context: SimulationContext): GameStoreState => ({ ...state, run: stepCombat(state.run, context, delta) })

export const skipRound = (state: GameStoreState, context: SimulationContext): GameStoreState => {
  if (state.run.enemies.length > 0 || state.run.pendingSpawns > 0) return state
  return enqueueNotification({ ...state, run: stepCombat({ ...state.run, round: { ...state.run.round, remaining: 0 } }, context, 0) }, 'round-skipped')
}
