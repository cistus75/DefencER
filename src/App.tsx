import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type Role = '근접' | '원거리' | '스킬' | '서포터'

type Unit = {
  id: number
  name: string
  shortName: string
  role: Role
  level: number
  slot: number
  color: string
  attack: string
  range: number
  attackSpeed: string
  skill: string
  skillDescription: string
}

type Card = {
  kind: '규칙' | '아이템'
  title: string
  subtitle: string
  description: string
  accent: string
  icon: 'vault' | 'speed' | 'radar'
}

const initialUnits: Unit[] = [
  { id: 1, name: '현우', shortName: '현', role: '근접', level: 2, slot: 1, color: '#c77d58', attack: '320', range: 1.5, attackSpeed: '1.00', skill: '선두 적 강타 · 4초', skillDescription: '4초마다 사거리 안의 선두 적을 강타해 추가 피해를 줍니다.' },
  { id: 2, name: '리오', shortName: '리', role: '원거리', level: 1, slot: 7, color: '#66a8c4', attack: '180', range: 3.5, attackSpeed: '1.35', skill: '집중 사격 · 4초', skillDescription: '4초마다 사거리 안의 선두 적을 향해 집중 사격을 가해 연속 피해를 줍니다.' },
  { id: 3, name: '아디나', shortName: '아', role: '스킬', level: 1, slot: 16, color: '#a78ac9', attack: '95', range: 3.5, attackSpeed: '0.80', skill: '범위 피해 · 6초', skillDescription: '6초마다 선두 적을 중심으로 범위 피해를 일으킵니다.' },
  { id: 4, name: '레니', shortName: '레', role: '서포터', level: 1, slot: 18, color: '#b1a15b', attack: '70', range: 2.5, attackSpeed: '0.90', skill: '곰돌이 표식 · 8초', skillDescription: '8초마다 사거리 안의 비서포터 실험체 하나에 곰돌이 표식을 부여합니다. 표식 대상의 적중 공격에 곰돌이가 추가 피해를 줍니다.' },
]

const clonePool: Omit<Unit, 'id' | 'slot'>[] = [
  { name: '현우', shortName: '현', role: '근접', level: 1, color: '#c77d58', attack: '260', range: 1.5, attackSpeed: '1.00', skill: '선두 적 강타 · 4초', skillDescription: '4초마다 사거리 안의 선두 적을 강타해 추가 피해를 줍니다.' },
  { name: '리오', shortName: '리', role: '원거리', level: 1, color: '#66a8c4', attack: '180', range: 3.5, attackSpeed: '1.35', skill: '집중 사격 · 4초', skillDescription: '4초마다 사거리 안의 선두 적을 향해 집중 사격을 가해 연속 피해를 줍니다.' },
  { name: '아디나', shortName: '아', role: '스킬', level: 1, color: '#a78ac9', attack: '95', range: 3.5, attackSpeed: '0.80', skill: '범위 피해 · 6초', skillDescription: '6초마다 선두 적을 중심으로 범위 피해를 일으킵니다.' },
  { name: '레니', shortName: '레', role: '서포터', level: 1, color: '#b1a15b', attack: '70', range: 2.5, attackSpeed: '0.90', skill: '곰돌이 표식 · 8초', skillDescription: '8초마다 사거리 안의 비서포터 실험체 하나에 곰돌이 표식을 부여합니다. 표식 대상의 적중 공격에 곰돌이가 추가 피해를 줍니다.' },
]

const cards: Card[] = [
  { kind: '규칙', title: '자유 복제', subtitle: '다음 3회', description: '다음 3회 복제 비용이 0이 됩니다. 무료 복제도 복제 횟수에 포함됩니다.', accent: '#5eabb7', icon: 'vault' },
  { kind: '아이템', title: '큐브 워치', subtitle: '공격 속도 +18%', description: '현우 또는 리오에게 장착하면 기본 공격 속도가 18% 증가합니다.', accent: '#b7a262', icon: 'speed' },
  { kind: '아이템', title: '레이더', subtitle: '사거리 +20%', description: '짧은 사거리 실험체 하나의 기본 공격 사거리를 20% 늘립니다.', accent: '#809fb0', icon: 'radar' },
]

const slotShape: Array<[number, number]> = [
  [10, 0], [116, 0], [126, 9], [126, 99],
  [116, 108], [10, 108], [0, 99], [0, 9],
]

const slotOrigins: Array<[number, number]> = [
  [309, 307], [463, 307], [615, 307], [766, 307], [918, 309],
  [307, 452], [463, 452], [615, 452], [766, 452], [923, 452],
  [302, 593], [461, 593], [613, 593], [767, 593], [928, 593],
  [298, 738], [458, 738], [612, 738], [768, 738], [932, 739],
]

function getSlotGeometry(slot: number) {
  const [x, y] = slotOrigins[slot]
  const polygon = slotShape.map(([pointX, pointY]) => [x + pointX, y + pointY])

  return {
    points: polygon.map(([x, y]) => `${x},${y}`).join(' '),
    x,
    y,
    width: 126,
    height: 108,
  }
}

function Icon({ name, size = 18 }: { name: 'crosshair' | 'coin' | 'clock' | 'shield' | 'target' | 'arrow' | 'close' | 'vault' | 'speed' | 'radar'; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  const paths = {
    crosshair: <><circle cx="12" cy="12" r="6.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></>,
    coin: <><path d="m12 2 7 4v12l-7 4-7-4V6z" /><path d="M9.5 9.5 12 8l2.5 1.5v3L12 14l-2.5-1.5z" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    shield: <path d="M12 3 19 6v5c0 4.7-3 8.1-7 10-4-1.9-7-5.3-7-10V6z" />,
    target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    arrow: <><path d="M5 12h13M13 7l5 5-5 5" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    vault: <><path d="M5 5h14v14H5z" /><path d="M8 8h8v8H8zM12 10v4M10 12h4" /></>,
    speed: <><path d="M4 15a8 8 0 1 1 16 0" /><path d="m12 12 4-4M7 18h10" /></>,
    radar: <><circle cx="12" cy="12" r="8" /><path d="M12 4v8l5.5 5.5M12 12l-5 5M4 12h4" /></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function CreditToken() {
  return <span className="credit-token" aria-hidden="true"><i /></span>
}

function RuleHistory() {
  return (
    <aside className="side-panel rule-history" aria-label="선택한 카드 기록">
      <header className="panel-header panel-header--brand">
        <div className="brand-line"><span className="brand-mark"><Icon name="crosshair" size={17} /></span><strong>DefencER</strong></div>
      </header>

      <div className="history-heading">
        <strong>카드 기록</strong>
      </div>

      <div className="rule-list">
        <article className="rule-card rule-card--active">
          <div className="rule-card__icon"><Icon name="vault" size={18} /></div>
          <div className="rule-card__copy"><span className="rule-card__type">규칙 · ROUND 01</span><strong>외곽 전술</strong><p>외곽 슬롯 피해 <b>+20%</b><br />안쪽 슬롯 피해 <b>-15%</b></p></div>
        </article>
        <article className="rule-card">
          <div className="rule-card__icon"><Icon name="speed" size={18} /></div>
          <div className="rule-card__copy"><span className="rule-card__type">아이템 · ROUND 02</span><strong>큐브 워치</strong><p>장착: <b>리오</b><br />기본 공격 속도 <b>+18%</b></p></div>
        </article>
      </div>

      <div className="left-status">
        <div className="status-row"><span>다음 카드 선택</span><strong>ROUND 05</strong></div>
        <div className="status-row"><span>리롤 보유</span><strong className="status-row__gold">03</strong></div>
      </div>
    </aside>
  )
}

function UnitBadge({ unit }: { unit: Unit }) {
  const skillProgress = unit.role === '서포터' ? '68%' : '42%'

  return (
    <div className="unit-badge" style={{ '--unit-color': unit.color } as CSSProperties}>
      <span className="unit-badge__level">{unit.level}★</span>
      <strong>{unit.name}</strong>
      <div className="unit-badge__portrait"><span>{unit.shortName}</span><i /></div>
      <div className="skill-progress skill-progress--unit" aria-hidden="true"><i style={{ width: skillProgress }} /></div>
    </div>
  )
}

function Battlefield({ units, selectedSlot, dragOverSlot, onSelectSlot, onDiscard, onDragStart, onDrop, onDragOver, onDragEnd }: {
  units: Unit[]
  selectedSlot: number | null
  dragOverSlot: number | null
  onSelectSlot: (slot: number) => void
  onDiscard: () => void
  onDragStart: (slot: number) => void
  onDrop: (slot: number) => void
  onDragOver: (slot: number) => void
  onDragEnd: () => void
}) {
  const unitBySlot = useMemo(() => new Map(units.map((unit) => [unit.slot, unit])), [units])
  const selectedUnit = selectedSlot === null ? undefined : unitBySlot.get(selectedSlot)
  const selectedGeometry = selectedSlot === null ? undefined : getSlotGeometry(selectedSlot)

  return (
    <div className="battlefield" aria-label="중앙 전투 구역">
      <img className="battlefield-art" src="/back.png" alt="연구시설 중앙 전투 구역" />
      <div className="battlefield-shade" />

      <svg className="placement-board" viewBox="0 0 1374 1145" preserveAspectRatio="xMidYMid slice" role="grid" aria-label="실험체 배치판 4행 5열">
        {Array.from({ length: 20 }, (_, slot) => {
          const unit = unitBySlot.get(slot)
          const isSelected = selectedSlot === slot
          const isDropTarget = dragOverSlot === slot
          const geometry = getSlotGeometry(slot)
          return (
            <g
              key={slot}
              className={`placement-slot ${unit ? 'placement-slot--occupied' : ''} ${isSelected ? 'placement-slot--selected' : ''} ${isDropTarget ? 'placement-slot--drop' : ''}`}
              role="gridcell"
              tabIndex={0}
              aria-selected={isSelected}
              aria-label={unit ? `${unit.name} ${unit.level}성 슬롯 ${slot + 1}` : `빈 배치 슬롯 ${slot + 1}`}
              onClick={() => onSelectSlot(slot)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectSlot(slot)
                }
              }}
              onDragOver={(event) => { event.preventDefault(); onDragOver(slot) }}
              onDrop={(event) => { event.preventDefault(); onDrop(slot) }}
            >
              <polygon className="placement-slot__surface" points={geometry.points} />
              {unit && (
                <foreignObject className="slot-unit" x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height}>
                  <div
                    className="slot-unit__content"
                    draggable
                    onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; onDragStart(slot) }}
                    onDragEnd={onDragEnd}
                  >
                    <UnitBadge unit={unit} />
                  </div>
                </foreignObject>
              )}
            </g>
          )
        })}
        {selectedUnit && selectedGeometry && (
          <foreignObject className="unit-action-popover" x={selectedGeometry.x + 22} y={selectedGeometry.y + 107} width="82" height="30">
            <button className="unit-discard-popover" type="button" draggable={false} aria-label={`${selectedUnit.name} 폐기`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onDiscard() }}>폐기</button>
          </foreignObject>
        )}
      </svg>

    </div>
  )
}

function BattleInfo() {
  return (
    <section className="side-panel battle-info" aria-label="전투 정보">
      <header className="panel-header panel-header--row"><div><strong>전투 정보</strong><span>BATTLE INFO</span></div></header>
      <div className="round-readout"><div><span className="eyebrow">CURRENT ROUND</span><div className="round-number"><strong>03</strong><em>/ 10</em></div></div><div className="timer"><Icon name="clock" size={16} /><strong>00:18</strong><span>남은 시간</span></div></div>
    </section>
  )
}

function DetailPanel({ unit }: { unit?: Unit }) {
  if (!unit) {
    return <section className="side-panel detail-panel" aria-label="선택 상세"><div className="detail-empty"><p>배치된 실험체를 선택하면<br />전투 정보가 표시됩니다.</p></div></section>
  }
  return (
    <section className="side-panel detail-panel detail-panel--selected" aria-label={`${unit.name} 상세 정보`}>
      <header className="detail-header"><div><h2>{unit.name} <small>{unit.level}성</small></h2><span className="role-pill" style={{ '--role-color': unit.color } as CSSProperties}>{unit.role}</span></div><div className="detail-portrait" style={{ '--unit-color': unit.color } as CSSProperties}>{unit.shortName}<i /></div></header>
      <div className="detail-stats"><div><span>공격력</span><strong>{unit.attack}</strong></div><div><span>사거리</span><strong>{unit.range}</strong></div><div><span>공격 속도</span><strong>{unit.attackSpeed}</strong></div></div>
      <div className="skill-block"><span className="eyebrow">스킬</span><strong>{unit.skill}</strong><div className="skill-progress"><i style={{ width: unit.role === '서포터' ? '68%' : '42%' }} /></div><p className="skill-description">{unit.skillDescription}</p></div>
    </section>
  )
}

function CardOverlay({ onClose, onChoose }: { onClose: () => void; onChoose: (card: Card) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className="card-overlay" role="dialog" aria-modal="true" aria-label="라운드 카드 선택">
      <div className="card-overlay__scrim" />
      <section className="card-choice-panel">
        <header className="card-choice-header"><div><span className="eyebrow">ROUND 05 · CHOOSE ONE</span><h2>작전 카드를 선택하십시오</h2></div><button className="icon-button" onClick={onClose} aria-label="카드 선택 닫기"><Icon name="close" size={20} /></button></header>
        <div className="card-grid">
          {cards.map((card) => <button key={card.title} className={`choice-card ${selected === card.title ? 'choice-card--selected' : ''}`} style={{ '--card-accent': card.accent } as CSSProperties} onClick={() => setSelected(card.title)}>
            <span className="choice-card__type">{card.kind}</span><span className="choice-card__serial">01 / 08</span><div className="choice-card__icon"><Icon name={card.icon} size={37} /></div><div className="choice-card__body"><strong>{card.title}</strong><span>{card.subtitle}</span><p>{card.description}</p></div><span className="choice-card__select">{selected === card.title ? 'SELECTED' : 'SELECT'}</span>
          </button>)}
        </div>
        <div className="reroll-row"><button className="reroll-button" aria-label="카드 3장 다시 뽑기"><span>↻</span><b>03</b></button><span>리롤을 사용해 현재 카드 3장을 다시 뽑습니다.</span></div>
        <div className="card-choice-footer"><span><Icon name="clock" size={15} /> 선택 대기 중 · 제한 시간 없음</span><button className="primary-button" disabled={!selected} onClick={() => { const card = cards.find((item) => item.title === selected); if (card) onChoose(card) }}>카드 적용 <Icon name="arrow" size={16} /></button></div>
      </section>
    </div>
  )
}

function App() {
  const [units, setUnits] = useState<Unit[]>(initialUnits)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(1)
  const [dragSlot, setDragSlot] = useState<number | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)
  const [credits, setCredits] = useState(350)
  const [cloneCount, setCloneCount] = useState(1)
  const [showCards, setShowCards] = useState(false)
  const [notice, setNotice] = useState({ id: 0, message: '' })

  const cloneCost = 10 + cloneCount * 10
  const selectedUnit = units.find((unit) => unit.slot === selectedSlot)

  const reportNotice = (message: string) => {
    setNotice((current) => ({ id: current.id + 1, message }))
  }

  useEffect(() => {
    if (!notice.message) return
    const timeout = window.setTimeout(() => {
      setNotice((current) => current.id === notice.id ? { ...current, message: '' } : current)
    }, 3400)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const cloneUnit = () => {
    if (units.length >= 20) return reportNotice('복제 중단 · 가용 슬롯 없음')
    if (credits < cloneCost) return reportNotice('복제 중단 · 보유 크레딧 부족')
    const occupied = new Set(units.map((unit) => unit.slot))
    const slot = Array.from({ length: 20 }, (_, index) => index).find((index) => !occupied.has(index)) ?? 0
    const template = clonePool[cloneCount % clonePool.length]
    const newUnit = { ...template, id: Date.now(), slot }
    setUnits((current) => [...current, newUnit])
    setCredits((current) => current - cloneCost)
    setCloneCount((current) => current + 1)
    setSelectedSlot(slot)
    reportNotice(`복제 완료 · ${newUnit.name} / SLOT ${String(slot + 1).padStart(2, '0')}`)
  }

  const discardSelected = () => {
    if (!selectedUnit) return
    setUnits((current) => current.filter((unit) => unit.id !== selectedUnit.id))
    reportNotice(`폐기 완료 · ${selectedUnit.name} / 자원 회수 없음`)
    setSelectedSlot(null)
  }

  const dropUnit = (targetSlot: number) => {
    if (dragSlot === null || dragSlot === targetSlot) return
    setUnits((current) => current.map((unit) => unit.slot === dragSlot ? { ...unit, slot: targetSlot } : unit.slot === targetSlot ? { ...unit, slot: dragSlot } : unit))
    setSelectedSlot(targetSlot)
    reportNotice('위치 변환 완료')
    setDragSlot(null)
    setDragOverSlot(null)
  }

  return (
    <main className="game-shell">
      <RuleHistory />
      <section className="center-stage" aria-label="전투 화면">
        <header className="stage-topbar">
          <div className="monster-counter" aria-label="방어 안정도 72퍼센트"><Icon name="shield" size={18} /><span>방어 안정도</span><strong>72</strong><em>%</em></div>
        </header>
        <Battlefield units={units} selectedSlot={selectedSlot} dragOverSlot={dragOverSlot} onSelectSlot={setSelectedSlot} onDiscard={discardSelected} onDragStart={setDragSlot} onDrop={dropUnit} onDragOver={setDragOverSlot} onDragEnd={() => { setDragSlot(null); setDragOverSlot(null) }} />
        <div className="bottom-actions"><button className="clone-button" onClick={cloneUnit}><strong>실험체 복제</strong><span className="clone-cost"><CreditToken /> 현재 비용 {cloneCost}</span></button><div className="credit-box"><span>보유 크레딧</span><strong><CreditToken />{credits}</strong></div></div>
        <div key={notice.id} className="toast" aria-live="polite" data-visible={Boolean(notice.message)}>{notice.message}</div>
      </section>
      <aside className="right-column"><BattleInfo /><DetailPanel unit={selectedUnit} /></aside>
      {showCards && <CardOverlay onClose={() => setShowCards(false)} onChoose={(card) => { setShowCards(false); reportNotice(`프로토콜 적용 완료 · ${card.title}`) }} />}
    </main>
  )
}

export default App
