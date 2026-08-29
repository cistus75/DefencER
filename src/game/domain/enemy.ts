import type { EnemyDefinitionId } from './common'
export type EnemyInstance = { id: number; definitionId: EnemyDefinitionId; hp: number; maxHp: number; trackDistance: number; travelledDistance: number; dead?: boolean }
