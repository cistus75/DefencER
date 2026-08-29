import { useState } from 'react'
export const useGameUiState=()=>{const [selectedUnitId,setSelectedUnitId]=useState<number>();const [overlayVisible,setOverlayVisible]=useState(true);const [highlightedCard,setHighlightedCard]=useState<string>();return {selectedUnitId,setSelectedUnitId,overlayVisible,setOverlayVisible,highlightedCard,setHighlightedCard}}
