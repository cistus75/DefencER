import type { CardId } from './common'
export type CardDefinition = { id: CardId; kind: '규칙'|'아이템'; title: string; subtitle: string; description: string; accent: string }
export type CardRecord = { cardId: CardId; round: number; unitId?: number }
