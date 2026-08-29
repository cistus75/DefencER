import type { CardId, SkillId, Slot, UnitDefinitionId } from './common'

export type UnitDefinition = { id: UnitDefinitionId; name: string; role: '근접' | '원거리' | '스킬' | '서포터'; asset: string; attack: number; attacksPerSecond: number; range: number; projectileSpeed: number; skillId: SkillId; skillCooldown: number; supportRatio: number; color: string }
export type SupportMark = { sourceId: number; remaining: number; ratio: number }
export type UnitInstance = { id: number; definitionId: UnitDefinitionId; slot: Slot; star: 1|2|3|4|5; item?: CardId; attackCooldown: number; skillCooldown: number; actionLock: number; marks: SupportMark[] }
