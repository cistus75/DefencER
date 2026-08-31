import type { RunState } from '../domain/run-state'
import type { SimulationContext } from './simulation-context'

export const spawnEnemies = (run: RunState, context: SimulationContext, delta: number): RunState => {
  if (run.round.kind === 'boss' || run.pendingSpawns === 0) return run
  let elapsed = run.round.spawnElapsed + delta
  let pending = run.pendingSpawns
  let spawned = run.round.spawned
  let enemies = run.enemies
  let counter = run.entityCounters.enemy
  while (elapsed + 0.0000001 >= context.config.balance.spawnInterval && pending > 0) {
    elapsed -= context.config.balance.spawnInterval
    spawned += 1
    pending -= 1
    counter += 1
    const definitionId = run.round.number >= 5 && spawned % 5 === 0 ? 'fast' : 'normal'
    const definition = context.config.enemies[definitionId]
    const hp = Math.round(definition.hp * (1 + 0.12 * (run.round.number - 1)))
    enemies = [...enemies, { id: counter, definitionId, hp, maxHp: hp, trackDistance: 0, travelledDistance: 0 }]
  }
  return { ...run, enemies, pendingSpawns: pending, round: { ...run.round, spawnElapsed: elapsed, spawned }, entityCounters: { ...run.entityCounters, enemy: counter } }
}
