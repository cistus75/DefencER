import type { EnemyDefinitionId } from './common'
export type EnemyDefinition = { name: string; asset: string; hp: number; speed: number; reward: number; size: number }
export type EnemyInstance = { id: number; definitionId: EnemyDefinitionId; hp: number; maxHp: number; trackDistance: number; travelledDistance: number; dead?: boolean }
