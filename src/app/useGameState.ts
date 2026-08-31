import { useGameContext } from './game-context'
export const useGameState=()=>useGameContext().state
export const useGameConfig=()=>useGameContext().config
