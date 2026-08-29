import { createContext, useContext } from 'react'
import type { GameStoreState } from '../game/application/game-store-state'
import type { GameAction } from '../game/application/game-action'
export const GameContext=createContext<{state:GameStoreState;dispatch:(action:GameAction)=>void}|null>(null)
export const useGameContext=()=>{const value=useContext(GameContext);if(!value)throw new Error('GameProvider가 필요합니다');return value}
