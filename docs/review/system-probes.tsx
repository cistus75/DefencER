/** Expected behavior probes. Failures are intentional evidence, not fixes. */
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useGameLoop } from '../../src/app/useGameLoop'
import { createInitialState } from '../../src/game/application/create-initial-state'
import { createGameReducer } from '../../src/game/application/game-reducer'
import { tickCardSelection } from '../../src/game/application/commands/card-commands'
import { selectedUnitViewModel } from '../../src/game/application/selectors/detail-selectors'
import { nextCardRound } from '../../src/game/application/selectors/hud-selectors'
import { cardHistoryViewModel } from '../../src/game/application/selectors/card-selectors'
import { boardViewModel, placementSlotsViewModel } from '../../src/game/application/selectors/board-selectors'
import { defaultGameConfig as config } from '../../src/game/config/default-game-config'
import { seededRandomGenerator as random } from '../../src/game/infrastructure/seeded-random-generator'
import { ruleCards } from '../../src/game/domain/rules/card-rules'
import { offerCards } from '../../src/game/simulation/round-resolution-system'
import { moveProjectiles } from '../../src/game/simulation/projectile-system'
import { PlacementBoard } from '../../src/ui/battlefield/PlacementBoard'
import { CardSelectionOverlay } from '../../src/ui/cards/CardSelectionOverlay'
import { useGameUiState } from '../../src/ui/hooks/useGameUiState'
import type { UnitInstance } from '../../src/game/domain/unit'
import type { GameAction } from '../../src/game/application/game-action'

const context = { config, random }
const reducer = createGameReducer(context)
const unit = (id = 1, slot = 0): UnitInstance => ({ id, slot, definitionId: 'rio', star: 1, attackCooldown: 0, skillCooldown: 4, actionLock: 0, marks: [] })
const noop = () => undefined

describe('review probes: defects and explicitly labelled policy/hardening cases', () => {
  it('R1 empty candidate pool must not permanently hold card selection', () => {
    const initial = createInitialState(1)
    const offered = offerCards({ ...initial.run, phase: 'combat', round: { ...initial.run.round, number: 35 }, activeRuleEffects: [...ruleCards] }, context)
    const next = tickCardSelection({ ...initial, run: offered }, 21, context)
    expect(next.run.phase).not.toBe('card-selection')
  })

  it('R3 existing specification explicitly allows queued same-tick AOE', () => {
    const initial = createInitialState(1).run
    const enemy = (id: number, hp: number) => ({ id, hp, maxHp: hp, definitionId: 'normal' as const, trackDistance: 0, travelledDistance: 0 })
    const projectile = (id: number, damage: number, areaRadius?: number) => ({ id, sourceId: 1, targetId: 1, damage, areaRadius, kind: 'skill' as const, delay: 0, speed: 1000, position: config.battlefield.pointOnTrack(0) })
    const next = moveProjectiles({ ...initial, enemies: [enemy(1, 10), enemy(2, 100)], projectiles: [projectile(1, 10), projectile(2, 30, 90)] }, context, 1 / 60)
    expect(next.enemies[1].hp).toBe(70)
  })

  it('R4 detail range includes extended sensors', () => {
    const run = { ...createInitialState().run, units: [unit()], activeRuleEffects: ['extended-sensors' as const] }
    expect(selectedUnitViewModel(run, config, 1)?.range).toBeCloseTo(3.92)
  })

  it('R4 detail APS includes rapid cycle', () => {
    const run = { ...createInitialState().run, units: [unit()], activeRuleEffects: ['rapid-cycle' as const] }
    expect(selectedUnitViewModel(run, config, 1)?.attacksPerSecond).toBeCloseTo(1.5525)
  })

  it.each([5, 10, 15, 20, 25, 30, 35])('R5 round %i combat still owes its current card', (number) => {
    const run = createInitialState().run
    expect(nextCardRound({ ...run, phase: 'combat', round: { ...run.round, number } })).toBe(number)
  })

  it('R6 item targeting must still show the deadline', () => {
    render(<CardSelectionOverlay remaining={1} offer={[]} itemTargeting units={[]} rerolls={0} onHighlight={noop} onApply={noop} onReroll={noop} onClose={noop} onEquip={noop} />)
    expect(screen.queryByText(/자동 선택까지 1초/)).not.toBeNull()
  })

  it('R9 an external drag with no slot payload must not move slot zero', () => {
    const onDrop = vi.fn()
    render(<PlacementBoard slots={placementSlotsViewModel(config)} units={boardViewModel({ ...createInitialState().run, units: [unit()] }, config)} canInteract onSelect={noop} onDragStart={noop} onDragTarget={noop} onDragEnd={noop} onDrop={onDrop} />)
    fireEvent.drop(screen.getByRole('gridcell', { name: '빈 배치 슬롯 2' }), { dataTransfer: { getData: () => '' } })
    expect(onDrop).not.toHaveBeenCalled()
  })

  it('R10 card history must not invent Hyunwoo for a removed Rio', () => {
    const initial = createInitialState()
    const state = { ...initial, run: { ...initial.run, units: [{ ...unit(), item: 'radar' as const }, unit(2, 1)], cards: [{ cardId: 'radar' as const, round: 5, unitId: 1 }] } }
    const merged = reducer(state, { type: 'MOVE_OR_MERGE', sourceSlot: 0, targetSlot: 1 })
    expect(cardHistoryViewModel(merged.run, config)[0].unitName).not.toBe('현우')
  })

  it('H2 reset within ready should clear stale drag state (API-only edge)', () => {
    const run = { ...createInitialState().run, units: [unit()] }
    const { result, rerender } = renderHook(({ value }) => useGameUiState(value), { initialProps: { value: run } })
    act(() => { result.current.setSelectedUnitId(1); result.current.setDragSourceSlot(0) })
    rerender({ value: createInitialState(99).run })
    expect(result.current.dragSourceSlot).toBeUndefined()
  })

  it('H1 invalid destination must not corrupt the board', () => {
    const initial = createInitialState()
    const state = { ...initial, run: { ...initial.run, units: [unit()] } }
    const next = reducer(state, { type: 'MOVE_OR_MERGE', sourceSlot: 0, targetSlot: 20 })
    expect(() => boardViewModel(next.run, config)).not.toThrow()
  })
})

describe('observed policies and non-regression boundaries', () => {
  it('bounded mixed-action fuzz preserves board, economy and entity invariants', () => {
    const phases = new Set<string>()
    for (let sample = 1; sample <= 16; sample += 1) {
      let decisionSeed = Math.imul(sample, 0x9e3779b9) >>> 0
      let state = createInitialState(decisionSeed)
      for (let index = 0; index < 4; index += 1) state = reducer(state, { type: 'CLONE_UNIT' })
      for (let index = 0; index < 12000; index += 1) {
        const choice = random.next(decisionSeed)
        decisionSeed = choice.seed
        const previous = state
        let action: GameAction = { type: 'TICK', delta: 1 / 60 }
        if (state.run.phase === 'ready') action = { type: 'START_ROUND' }
        else if (state.run.phase === 'card-selection') action = { type: 'TICK', delta: 21 }
        else if (state.run.phase === 'item-targeting') action = { type: 'TICK', delta: 21 }
        else if (state.run.phase === 'victory' || state.run.phase === 'defeat') break
        else if (choice.value > 0.99 && state.run.units.length) action = { type: 'MOVE_OR_MERGE', sourceSlot: state.run.units[index % state.run.units.length].slot, targetSlot: index % 20 }
        else if (choice.value > 0.98) action = { type: 'CLONE_UNIT' }
        else if (choice.value > 0.979 && state.run.units.length) action = { type: 'DISCARD_UNIT', unitId: state.run.units[index % state.run.units.length].id }
        const snapshot = index % 1000 === 0 ? JSON.stringify(previous) : undefined
        state = reducer(state, action)
        if (snapshot) expect(JSON.stringify(previous)).toBe(snapshot)
        phases.add(state.run.phase)
        const run = state.run
        const valid = Number.isFinite(run.credits) && run.credits >= 0
          && run.units.length <= 20 && new Set(run.units.map(u => u.slot)).size === run.units.length
          && run.units.every(u => Number.isInteger(u.slot) && u.slot >= 0 && u.slot < 20 && u.star >= 1 && u.star <= 5)
          && new Set(run.units.map(u => u.id)).size === run.units.length
          && new Set(run.enemies.map(e => e.id)).size === run.enemies.length
          && new Set(run.projectiles.map(p => p.id)).size === run.projectiles.length
          && run.units.every(u => u.id <= run.entityCounters.unit)
          && run.enemies.every(e => e.id <= run.entityCounters.enemy && Number.isFinite(e.hp))
          && run.projectiles.every(p => p.id <= run.entityCounters.projectile && Number.isFinite(p.damage))
          && run.freeCloneTickets >= 0 && run.rerolls >= 0 && run.pendingSpawns >= 0
          && new Set(run.cardOffer).size === run.cardOffer.length
          && state.notifications.length <= 5
        if (!valid) throw new Error(`invariant failed: seed=${sample}, iteration=${index}, action=${JSON.stringify(action)}`)
      }
    }
    console.info('FUZZ visited phases:', [...phases].sort().join(', '))
    expect(phases.has('combat')).toBe(true)
  }, 30000)

  it('candidate shortage yields two cards under four rules plus one item', () => {
    const run = { ...createInitialState().run, phase: 'combat' as const, units: [{ ...unit(), item: 'radar' as const }], activeRuleEffects: ruleCards.slice(0, 4) }
    expect(offerCards(run, context).cardOffer).toHaveLength(2)
  })

  it('card reroll keeps an already elapsed selection deadline', () => {
    const initial = createInitialState()
    const state = { ...initial, run: { ...offerCards({ ...initial.run, units: [unit()] }, context), cardSelectionRemaining: 3 } }
    expect(reducer(state, { type: 'REROLL_CARDS' }).run.cardSelectionRemaining).toBe(3)
  })

  it('card input locking blocks board mutation', () => {
    const initial = createInitialState()
    const state = { ...initial, run: { ...initial.run, phase: 'card-selection' as const, units: [unit()] } }
    for (const action of [{ type: 'CLONE_UNIT' }, { type: 'DISCARD_UNIT', unitId: 1 }, { type: 'MOVE_OR_MERGE', sourceSlot: 0, targetSlot: 1 }] as GameAction[]) {
      expect(reducer(state, action).run).toEqual(state.run)
    }
  })

  it('current loop deliberately counts only 0.1 seconds after a 1 second frame gap', () => {
    const frames: FrameRequestCallback[] = []
    vi.spyOn(performance, 'now').mockReturnValue(0)
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.push(callback); return frames.length })
    vi.stubGlobal('cancelAnimationFrame', noop)
    const dispatch = vi.fn()
    try {
      const { unmount } = renderHook(() => useGameLoop('card-selection', dispatch))
      act(() => frames.shift()?.(1000))
      expect(dispatch.mock.calls.reduce((sum, [action]) => sum + action.delta, 0)).toBeCloseTo(0.1)
      unmount()
    } finally {
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
    }
  })
})
