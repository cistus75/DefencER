import { useReducer } from 'react'
import { GameContext } from './game-context'
import { createInitialState } from '../game/application/create-initial-state'
import { gameReducer } from '../game/application/game-reducer'
import { useGameLoop } from './useGameLoop'
export function GameProvider({children}:{children:React.ReactNode}){const [state,dispatch]=useReducer(gameReducer,undefined,()=>createInitialState(Date.now()>>>0));useGameLoop(state.run.phase,dispatch);return <GameContext.Provider value={{state,dispatch}}>{children}</GameContext.Provider>}
