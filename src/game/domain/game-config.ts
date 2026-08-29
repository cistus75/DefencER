import type { CardDefinition } from './card'
import type { UnitDefinition } from './unit'
export type GameConfig = { units: Record<string, UnitDefinition>; cards: Record<string, CardDefinition> }
