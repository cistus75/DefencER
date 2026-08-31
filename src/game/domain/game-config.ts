import type { CardDefinition } from './card'
import type { CardId, EnemyDefinitionId, UnitDefinitionId, Vec2 } from './common'
import type { EnemyDefinition } from './enemy'
import type { UnitDefinition } from './unit'
export type RoundDefinition = { kind: 'normal' | 'boss'; total: number; duration: number }
export type GameConfig = {
  units: Record<UnitDefinitionId, UnitDefinition>
  enemies: Record<EnemyDefinitionId, EnemyDefinition>
  cards: Record<CardId, CardDefinition>
  roundDefinition: (round: number) => RoundDefinition
  battlefield: { slotCenter: (slot: number) => Vec2; pointOnTrack: (distance: number) => Vec2; trackLength: number; placementSlots: Array<{ slot: number; x: number; y: number; points: string }> }
  balance: { fixedStep: number; spawnInterval: number; supportProjectileSpeed: number; rangePixels: number }
}
