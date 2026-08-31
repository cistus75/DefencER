import { useGameCommands } from '../app/useGameCommands'
import { useGameConfig, useGameState } from '../app/useGameState'
import { boardViewModel, enemyActorsViewModel, placementSlotsViewModel, projectileActorsViewModel } from '../game/application/selectors/board-selectors'
import { cardHistoryViewModel, cardOfferViewModel, itemTargetViewModel } from '../game/application/selectors/card-selectors'
import { selectedUnitViewModel } from '../game/application/selectors/detail-selectors'
import { battleInfoViewModel, boardInteractionEnabled, hudViewModel, notificationViewModel, resultViewModel } from '../game/application/selectors/hud-selectors'
import { Battlefield } from './battlefield/Battlefield'
import { CardSelectionOverlay } from './cards/CardSelectionOverlay'
import { RunResultOverlay } from './feedback/RunResultOverlay'
import { ToastRegion } from './feedback/ToastRegion'
import { BottomActionBar } from './hud/BottomActionBar'
import { TopStatusBar } from './hud/TopStatusBar'
import { useGameUiState } from './hooks/useGameUiState'
import { BattleInfoPanel } from './panels/BattleInfoPanel'
import { CardHistoryPanel } from './panels/CardHistoryPanel'
import { UnitDetailPanel } from './panels/UnitDetailPanel'

export function GameScreen() {
  const { run, notifications } = useGameState()
  const dispatch = useGameCommands()
  const config = useGameConfig()
  const ui = useGameUiState(run)
  const selected = selectedUnitViewModel(run, config, ui.selectedUnitId)
  const board = boardViewModel(run, config)
  const hud = hudViewModel(run)
  const cards = run.phase === 'card-selection' || run.phase === 'item-targeting'
  const canManipulateBoard = boardInteractionEnabled(run.phase)

  const handleBoardDrop = (sourceSlot: number, targetSlot: number) => {
    const source = run.units.find((unit) => unit.slot === sourceSlot)
    const target = run.units.find((unit) => unit.slot === targetSlot)
    const mergesSelectedUnit = source !== undefined
      && source.id === ui.selectedUnitId
      && target !== undefined
      && source.definitionId === target.definitionId
      && source.star === target.star
      && source.star < 5

    dispatch({ type: 'MOVE_OR_MERGE', sourceSlot, targetSlot })
    if (mergesSelectedUnit) ui.setSelectedUnitId(target.id)
    ui.clearDrag()
  }

  return (
    <main className="game-shell">
      <CardHistoryPanel cards={cardHistoryViewModel(run, config)} rerolls={run.rerolls} />
      <section className="center-stage">
        <TopStatusBar count={hud.enemyCount} />
        <Battlefield
          slots={placementSlotsViewModel(config)}
          units={board}
          enemies={enemyActorsViewModel(run, config)}
          projectiles={projectileActorsViewModel(run)}
          selectedId={ui.selectedUnitId}
          canInteract={canManipulateBoard}
          dragSourceSlot={ui.dragSourceSlot}
          dragTargetSlot={ui.dragTargetSlot}
          onSelect={ui.setSelectedUnitId}
          onDragStart={ui.setDragSourceSlot}
          onDragTarget={ui.setDragTargetSlot}
          onDragEnd={ui.clearDrag}
          onDrop={handleBoardDrop}
        />
        <BottomActionBar
          credits={hud.credits}
          cost={hud.currentCost}
          next={hud.nextCost}
          tickets={hud.freeCloneTickets}
          disabled={cards || run.phase === 'victory' || run.phase === 'defeat'}
          onClone={() => dispatch({ type: 'CLONE_UNIT' })}
        />
        <ToastRegion
          notification={notificationViewModel(notifications[0])}
          onAcknowledge={() => dispatch({ type: 'ACKNOWLEDGE_NOTIFICATION' })}
        />
      </section>
      <aside className="right-column">
        <BattleInfoPanel
          viewModel={battleInfoViewModel(run)}
          onStart={() => dispatch({ type: 'START_ROUND' })}
          onSkip={() => dispatch({ type: 'SKIP_ROUND' })}
          onOpenCards={() => ui.setOverlayVisible(true)}
        />
        <UnitDetailPanel
          unit={selected}
          onDiscard={() => selected && dispatch({ type: 'DISCARD_UNIT', unitId: selected.id })}
        />
      </aside>
      {cards && ui.overlayVisible && (
        <CardSelectionOverlay
          offer={cardOfferViewModel(run, config)}
          highlighted={ui.highlightedCard}
          itemTargeting={run.phase === 'item-targeting'}
          units={itemTargetViewModel(run, config)}
          rerolls={run.rerolls}
          onHighlight={ui.setHighlightedCard}
          onApply={() => ui.highlightedCard && dispatch({ type: 'CHOOSE_CARD', cardId: ui.highlightedCard })}
          onReroll={() => dispatch({ type: 'REROLL_CARDS' })}
          onClose={() => ui.setOverlayVisible(false)}
          onEquip={(unitId) => dispatch({ type: 'EQUIP_PENDING_ITEM', unitId })}
        />
      )}
      <RunResultOverlay result={resultViewModel(run, config)} onReset={() => dispatch({ type: 'RESET_RUN' })} />
    </main>
  )
}
