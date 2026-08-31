import { createContext, useContext } from 'react'
import type { GameStoreState } from '../game/application/game-store-state'
import type { GameAction } from '../game/application/game-action'
import type { GameConfig } from '../game/domain/game-config'
export const GameContext=createContext<{state:GameStoreState;dispatch:(action:GameAction)=>void;config:GameConfig}|null>(null)
export const useGameContext=()=>{const value=useContext(GameContext);if(!value)throw new Error('GameProvider가 필요합니다');return value}
