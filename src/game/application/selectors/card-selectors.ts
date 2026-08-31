import type { CardId } from '../../domain/common'
import type { GameConfig } from '../../domain/game-config'
import type { RunState } from '../../domain/run-state'

export type CardOptionViewModel = { id: CardId; kind: '규칙' | '아이템'; title: string; subtitle: string; description: string; accent: string }
export type ItemTargetViewModel = { id: number; name: string; star: number; slot: number; asset: string; disabled: boolean }
export type CardHistoryViewModel = CardOptionViewModel & { round: number; unitName?: string }

const cardViewModel = (id: CardId, config: GameConfig): CardOptionViewModel => ({ ...config.cards[id], id })

export const cardOfferViewModel = (run: RunState, config: GameConfig): CardOptionViewModel[] => run.cardOffer.map((id) => cardViewModel(id, config))
export const itemTargetViewModel = (run: RunState, config: GameConfig): ItemTargetViewModel[] => run.units.map((unit) => ({ id: unit.id, name: config.units[unit.definitionId].name, star: unit.star, slot: unit.slot, asset: config.units[unit.definitionId].asset, disabled: Boolean(unit.item) }))
export const cardHistoryViewModel = (run: RunState, config: GameConfig): CardHistoryViewModel[] => run.cards.map((record) => ({ ...cardViewModel(record.cardId, config), round: record.round, unitName: record.unitId === undefined ? undefined : config.units[run.units.find((unit) => unit.id === record.unitId)?.definitionId ?? 'hyunwoo'].name }))
export const resultCardTitles = (run: RunState, config: GameConfig): string[] => run.cards.map((record) => config.cards[record.cardId].title)
