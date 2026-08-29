import { useGameContext } from './game-context'
export const useGameCommands=()=>useGameContext().dispatch
