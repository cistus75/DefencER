import type { GameConfig } from '../domain/game-config'
import type { RandomGenerator } from '../domain/ports/random-generator'
export type SimulationContext = { config: GameConfig; random: RandomGenerator }
