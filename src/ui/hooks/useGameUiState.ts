import { useEffect, useMemo, useState } from 'react'
import type { CardId } from '../../game/domain/common'
import type { RunState } from '../../game/domain/run-state'

export const useGameUiState = (run: RunState) => {
  const [selectedUnitId, setSelectedUnitId] = useState<number>()
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [highlightedCard, setHighlightedCard] = useState<CardId>()
  const [dragSourceSlot, setDragSourceSlot] = useState<number>()
  const [dragTargetSlot, setDragTargetSlot] = useState<number>()
  const offerKey = useMemo(() => run.cardOffer.join('|'), [run.cardOffer])

  useEffect(() => {
    if (selectedUnitId !== undefined && !run.units.some((unit) => unit.id === selectedUnitId)) {
      setSelectedUnitId(undefined)
    }
  }, [run.units, selectedUnitId])

  useEffect(() => {
    setHighlightedCard(undefined)
    if (run.phase === 'card-selection' || run.phase === 'item-targeting') setOverlayVisible(true)
  }, [offerKey, run.phase])

  useEffect(() => {
    if (run.phase !== 'ready' && run.phase !== 'combat') {
      setDragSourceSlot(undefined)
      setDragTargetSlot(undefined)
    }
    if (run.phase === 'ready' || run.phase === 'victory' || run.phase === 'defeat') {
      setSelectedUnitId(undefined)
    }
  }, [run.phase])

  const clearDrag = () => {
    setDragSourceSlot(undefined)
    setDragTargetSlot(undefined)
  }

  return {
    selectedUnitId,
    setSelectedUnitId,
    overlayVisible,
    setOverlayVisible,
    highlightedCard,
    setHighlightedCard,
    dragSourceSlot,
    setDragSourceSlot,
    dragTargetSlot,
    setDragTargetSlot,
    clearDrag,
  }
}
