import { cardDefinitions as cards } from './card-definitions'
import { enemyDefinitions as enemies } from './enemy-definitions'
import { unitDefinitions as units } from './unit-definitions'
import { pointOnTrack, slotCenter, slotOrigins, slotShape, trackLength } from './battlefield-config'
import { roundDefinition } from './round-definitions'
import { provisionalBalance } from './provisional-balance'
import type { GameConfig } from '../domain/game-config'

export const defaultGameConfig: GameConfig = {
  units,
  enemies,
  cards,
  roundDefinition,
  battlefield: { slotCenter, pointOnTrack, trackLength, placementSlots: slotOrigins.map((origin, slot) => ({ slot, x: origin.x, y: origin.y, points: slotShape.map(([x, y]) => `${origin.x + x},${origin.y + y}`).join(' ') })) },
  balance: { fixedStep: provisionalBalance.fixedStep, spawnInterval: 0.3, supportProjectileSpeed: 1100, rangePixels: 150 },
}
