import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createInitialState } from '../game/application/create-initial-state'
import { gameReducer, simulationContext } from './state-builders'
import { actUnits } from '../game/simulation/unit-action-system'
import { EnemyLayer } from '../ui/battlefield/EnemyLayer'
import { ProjectileLayer } from '../ui/battlefield/ProjectileLayer'
import { combinedSupportRatio } from '../game/simulation/support-resolution'
import { moveProjectiles } from '../game/simulation/projectile-system'
import { pointOnTrack } from '../game/config/battlefield-config'
import { TopStatusBar } from '../ui/hud/TopStatusBar'
import { ToastRegion } from '../ui/feedback/ToastRegion'
import { RunResultOverlay } from '../ui/feedback/RunResultOverlay'
import { resultViewModel } from '../game/application/selectors/hud-selectors'
import { CardSelectionOverlay } from '../ui/cards/CardSelectionOverlay'
import { PlacementBoard } from '../ui/battlefield/PlacementBoard'
import { placementSlotsViewModel } from '../game/application/selectors/board-selectors'

describe('명세 회귀', () => {
  it('선택한 실험체가 없을 때 빈 배치 슬롯을 선택 상태로 표시하지 않는다', () => {
    const { container } = render(<PlacementBoard
      slots={placementSlotsViewModel(simulationContext.config)}
      units={[]}
      canInteract
      onSelect={() => undefined}
      onDragStart={() => undefined}
      onDragTarget={() => undefined}
      onDragEnd={() => undefined}
      onDrop={() => undefined}
    />)

    expect(container.querySelectorAll('[aria-selected="true"]')).toHaveLength(0)
    expect(container.querySelectorAll('.placement-slot--selected')).toHaveLength(0)
  })

  it('토스트는 렌더 callback이 바뀌어도 최초 표시 3.4초 후 한 번 acknowledge한다', () => {
    vi.useFakeTimers()
    const acknowledge = vi.fn()
    const notification = { id: 1, code: 'unit-moved' as const, message: '배치 이동 완료' }
    const { rerender } = render(<ToastRegion notification={notification} onAcknowledge={acknowledge} />)
    act(() => vi.advanceTimersByTime(2000))
    rerender(<ToastRegion notification={notification} onAcknowledge={() => acknowledge()} />)
    act(() => vi.advanceTimersByTime(1400))
    expect(acknowledge).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('결과 화면은 선택 카드와 런 요약을 모두 표시한다', () => {
    const initial = createInitialState(1).run
    const run = { ...initial, phase: 'victory' as const, result: 'alpha' as const, cards: [{ cardId: 'outer-tactics' as const, round: 5 }] }
    render(<RunResultOverlay result={resultViewModel(run, simulationContext.config)} onReset={() => undefined} />)
    expect(screen.getByRole('heading', { name: '실험 완료 / 알파 처치' })).toBeInTheDocument()
    expect(screen.getByText('외곽 전술')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '새 런 시작' })).toHaveFocus()
    expect(fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' })).toBe(false)
  })

  it('카드 dialog는 닫기 버튼에 초점을 두고 Escape로 닫힌다', () => {
    const close = vi.fn()
    render(<CardSelectionOverlay offer={[{ id: 'free-clone', kind: '규칙', title: '자유 복제', subtitle: '다음 3회', description: '설명', accent: '#fff' }]} itemTargeting={false} units={[]} rerolls={3} onHighlight={() => undefined} onApply={() => undefined} onReroll={() => undefined} onClose={close} onEquip={() => undefined} />)
    expect(screen.getByRole('button', { name: '카드 선택 닫기' })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('카드 확정 후 아이템 대상 dialog로 전환해도 초점을 dialog 안에 유지한다', () => {
    const props = { offer: [{ id: 'cube-watch' as const, kind: '아이템' as const, title: '큐브 워치', subtitle: '공격 속도 +18%', description: '설명', accent: '#fff' }], highlighted: 'cube-watch' as const, units: [{ id: 1, name: '현우', star: 1 as const, slot: 0, asset: '/units/hyunwoo.webp', disabled: false }], rerolls: 3, onHighlight: () => undefined, onApply: () => undefined, onReroll: () => undefined, onClose: () => undefined, onEquip: () => undefined }
    const { rerender } = render(<CardSelectionOverlay {...props} itemTargeting={false} />)

    screen.getByRole('button', { name: '카드 적용' }).focus()
    rerender(<CardSelectionOverlay {...props} itemTargeting />)

    expect(screen.getByRole('button', { name: '카드 선택 닫기' })).toHaveFocus()
    expect(screen.getByRole('button', { name: '현우 1성 · SLOT 01' })).toBeInTheDocument()
  })

  it('필드 적 40~49는 경고, 50은 위험 상태를 색 외 클래스와 값으로 구분한다', () => {
    const { rerender } = render(<TopStatusBar count={40} />)
    expect(screen.getByText('필드 적').closest('.stage-topbar')).toHaveClass('stage-topbar--warning')
    rerender(<TopStatusBar count={50} />)
    expect(screen.getByText('필드 적').closest('.stage-topbar')).toHaveClass('stage-topbar--danger')
  })
  it('9라운드 종료 직후 10라운드 알파를 즉시 필드에 추가한다', () => {
    const initial = createInitialState(11)
    const state = {
      ...initial,
      run: {
        ...initial.run,
        phase: 'combat' as const,
        round: { number: 9, kind: 'normal' as const, remaining: 0, started: true, spawnElapsed: 0, spawned: 13, total: 13 },
        pendingSpawns: 0,
      },
    }

    const next = gameReducer(state, { type: 'TICK', delta: 1 / 60 })

    expect(next.run.round.number).toBe(10)
    expect(next.run.round.remaining).toBe(60)
    expect(next.run.enemies).toEqual([
      expect.objectContaining({ definitionId: 'alpha', hp: 3200, maxHp: 3200 }),
    ])
  })

  it('레니는 후보가 있으면 seeded RNG로 비서포터에게 4초 표식을 부여한다', () => {
    const run = createInitialState(23).run
    const next = actUnits({
      ...run,
      phase: 'combat',
      units: [
        { id: 1, definitionId: 'leni', slot: 6, star: 1, attackCooldown: 0, skillCooldown: 0, actionLock: 0, marks: [] },
        { id: 2, definitionId: 'hyunwoo', slot: 5, star: 1, attackCooldown: 0, skillCooldown: 4, actionLock: 0, marks: [] },
      ],
    }, simulationContext)

    expect(next.randomSeed).not.toBe(run.randomSeed)
    expect(next.units.find((unit) => unit.id === 1)?.skillCooldown).toBe(8)
    expect(next.units.find((unit) => unit.id === 2)?.marks).toEqual([
      { sourceId: 1, remaining: 4, ratio: 0.2 },
    ])
  })

  it('적 레이어는 배치판과 같은 기준 좌표계와 cover 매핑을 사용한다', () => {
    const { container } = render(<EnemyLayer enemies={[
      { id: 1, definitionId: 'normal', x: 255, y: 208, radius: 12, hpRatio: 1 },
    ]} />)

    const layer = container.querySelector('svg.enemy-layer')
    expect(layer).toHaveAttribute('viewBox', '0 0 1374 1145')
    expect(layer).toHaveAttribute('preserveAspectRatio', 'xMidYMid slice')
    expect(container.querySelector('.enemy')?.tagName).toBe('DIV')
    expect(container.querySelector<HTMLElement>('.enemy')?.style.transform).toContain('translate3d(243px, 196px, 0)')
  })

  it('투사체는 같은 cover 좌표계의 DOM actor를 CSS transform으로 이동한다', () => {
    const { container } = render(<ProjectileLayer projectiles={[{ id: 1, kind: 'skill', x: 255, y: 208 }]} />)

    const layer = container.querySelector('svg.projectile-layer')
    expect(layer).toHaveAttribute('viewBox', '0 0 1374 1145')
    expect(container.querySelector('.projectile')?.tagName).toBe('DIV')
    expect(container.querySelector<HTMLElement>('.projectile')?.style.transform).toContain('translate3d(251px, 204px, 0)')
  })

  it('레니 표식은 곱연산으로 중첩하고 80%에서 제한한다', () => {
    expect(combinedSupportRatio([{ sourceId: 1, remaining: 4, ratio: 0.2 }])).toBeCloseTo(0.2)
    expect(combinedSupportRatio([
      { sourceId: 1, remaining: 4, ratio: 0.2 },
      { sourceId: 2, remaining: 4, ratio: 0.2 },
    ])).toBeCloseTo(0.44)
    expect(combinedSupportRatio([
      { sourceId: 1, remaining: 4, ratio: 0.2 },
      { sourceId: 2, remaining: 4, ratio: 0.2 },
      { sourceId: 3, remaining: 4, ratio: 0.2 },
    ])).toBeCloseTo(0.728)
    expect(combinedSupportRatio([
      { sourceId: 1, remaining: 4, ratio: 0.468 },
      { sourceId: 2, remaining: 4, ratio: 0.468 },
    ])).toBe(0.8)
  })

  it('표식 대상의 기본 공격 적중은 곰돌이 투사체 하나를 만들고 각 레니 쿨타임을 줄인다', () => {
    const run = createInitialState(31).run
    const impact = pointOnTrack(0)
    const next = moveProjectiles({
      ...run,
      phase: 'combat',
      units: [
        { id: 1, definitionId: 'leni', slot: 5, star: 1, attackCooldown: 0, skillCooldown: 4, actionLock: 0, marks: [] },
        { id: 2, definitionId: 'leni', slot: 6, star: 1, attackCooldown: 0, skillCooldown: 5, actionLock: 0, marks: [] },
        { id: 3, definitionId: 'hyunwoo', slot: 0, star: 1, attackCooldown: 1, skillCooldown: 4, actionLock: 0, marks: [
          { sourceId: 1, remaining: 4, ratio: 0.2 },
          { sourceId: 2, remaining: 4, ratio: 0.2 },
        ] },
      ],
      enemies: [{ id: 1, definitionId: 'normal', hp: 100, maxHp: 100, trackDistance: 0, travelledDistance: 0 }],
      projectiles: [{ id: 1, sourceId: 3, targetId: 1, kind: 'basic', damage: 20, speed: 900, delay: 0, position: impact }],
      entityCounters: { unit: 3, enemy: 1, projectile: 1 },
    }, simulationContext, 1 / 60)

    expect(next.enemies[0].hp).toBe(80)
    expect(next.projectiles).toEqual([
      expect.objectContaining({ id: 2, kind: 'support', targetId: 1, speed: 1100, supports: [1, 2] }),
    ])
    expect(next.projectiles[0].damage).toBeCloseTo(8.8)
    expect(next.units.find((unit) => unit.id === 1)?.skillCooldown).toBe(3.75)
    expect(next.units.find((unit) => unit.id === 2)?.skillCooldown).toBe(4.75)
  })
})
