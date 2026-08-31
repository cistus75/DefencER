import type { RunState } from '../domain/run-state'
import type { SimulationContext } from './simulation-context'

export const moveEnemies = (run: RunState, context: SimulationContext, delta: number): RunState => ({ ...run, enemies: run.enemies.map((enemy) => { const speed = context.config.enemies[enemy.definitionId].speed; return { ...enemy, trackDistance: (enemy.trackDistance + speed * delta) % context.config.battlefield.trackLength, travelledDistance: enemy.travelledDistance + speed * delta } }) })
