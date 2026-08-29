import type { ActiveRuleEffects } from './effects'
import type { CardId, Phase } from './common'
import type { CardRecord } from './card'
import type { EnemyInstance } from './enemy'
import type { Projectile } from './projectile'
import type { RoundState } from './round'
import type { UnitInstance } from './unit'
export type RunState = { phase: Phase; round: RoundState; credits: number; successfulCloneCount: number; freeCloneTickets: number; rerolls: number; units: UnitInstance[]; enemies: EnemyInstance[]; projectiles: Projectile[]; cards: CardRecord[]; activeRuleEffects: ActiveRuleEffects; cardOffer: CardId[]; pendingCard?: CardId; randomSeed: number; entityCounters: { unit: number; enemy: number; projectile: number }; result?: 'overflow'|'timeout'|'alpha'; pendingSpawns: number }
