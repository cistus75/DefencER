import { useReducer } from 'react'
import { createInitialState } from '../game/application/create-initial-state'
import { createGameReducer } from '../game/application/game-reducer'
import { defaultGameConfig } from '../game/config/default-game-config'
import { seededRandomGenerator } from '../game/infrastructure/seeded-random-generator'
import type { SimulationContext } from '../game/simulation/simulation-context'
import { GameContext } from './game-context'
import { useGameLoop } from './useGameLoop'

const simulationContext: SimulationContext = { config: defaultGameConfig, random: seededRandomGenerator }
const gameReducer = createGameReducer(simulationContext)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState(Date.now() >>> 0))
  useGameLoop(state.run.phase, dispatch)
  return <GameContext.Provider value={{ state, dispatch, config: defaultGameConfig }}>{children}</GameContext.Provider>
}
