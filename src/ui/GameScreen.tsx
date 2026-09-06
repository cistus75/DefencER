import { useGameCommands } from '../app/useGameCommands'
import { useGameConfig, useGameState } from '../app/useGameState'
import { boardViewModel, enemyActorsViewModel, placementSlotsViewModel, projectileActorsViewModel } from '../game/application/selectors/board-selectors'
import { cardHistoryViewModel, cardOfferViewModel, itemTargetViewModel } from '../game/application/selectors/card-selectors'
import { selectedUnitViewModel } from '../game/application/selectors/detail-selectors'
import { battleInfoViewModel, boardInteractionEnabled, hudViewModel, nextCardRound, notificationViewModel, resultViewModel } from '../game/application/selectors/hud-selectors'
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
  const cloneDisabledReason = cards ? '카드 선택 중' : run.phase === 'victory' || run.phase === 'defeat' ? '런 종료' : run.units.length >= 20 ? '가용 슬롯 없음' : hud.freeCloneTickets === 0 && hud.credits < hud.currentCost ? '크레딧 부족' : undefined

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
      <CardHistoryPanel cards={cardHistoryViewModel(run, config)} rerolls={run.rerolls} nextRound={nextCardRound(run)} />
      <section className="center-stage">
        <TopStatusBar count={hud.enemyCount} state={run.phase === 'combat' ? '교전 중' : run.phase === 'ready' ? '배치 준비' : run.phase === 'victory' ? '실험 완료' : run.phase === 'defeat' ? '실험 종료' : '카드 분석'} />
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
          disabled={cloneDisabledReason !== undefined}
          disabledReason={cloneDisabledReason}
          onClone={() => dispatch({ type: 'CLONE_UNIT' })}
        />
        <ToastRegion
          notification={notificationViewModel(notifications[0])}
          onAcknowledge={() => dispatch({ type: 'ACKNOWLEDGE_NOTIFICATION' })}
        />
      </section>
      <aside className="right-column">
        <BattleInfoPanel
          viewModel={battleInfoViewModel(run, config)}
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
          round={run.round.number}
          remaining={run.cardSelectionRemaining}
          offer={cardOfferViewModel(run, config)}
          pendingCard={run.pendingCard ? cardOfferViewModel({ ...run, cardOffer: [run.pendingCard] }, config)[0] : undefined}
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
