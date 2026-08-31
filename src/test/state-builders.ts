import { createInitialState } from '../game/application/create-initial-state'
import { createGameReducer } from '../game/application/game-reducer'
import { defaultGameConfig } from '../game/config/default-game-config'
import { seededRandomGenerator } from '../game/infrastructure/seeded-random-generator'
import type { SimulationContext } from '../game/simulation/simulation-context'

export const simulationContext: SimulationContext = { config: defaultGameConfig, random: seededRandomGenerator }
export const gameReducer = createGameReducer(simulationContext)
export const runState = (seed=1) => createInitialState(seed)
