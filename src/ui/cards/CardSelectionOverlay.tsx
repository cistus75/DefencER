import { useEffect, useRef } from 'react'
import type { CardOptionViewModel, ItemTargetViewModel } from '../../game/application/selectors/card-selectors'
import type { CardId } from '../../game/domain/common'
import { CardOption } from './CardOption'
import { ItemTargetPicker } from './ItemTargetPicker'

export function CardSelectionOverlay({ round = 5, remaining, offer, highlighted, itemTargeting, pendingCard, units, rerolls, onHighlight, onApply, onReroll, onClose, onEquip }: { round?: number; remaining?: number; offer: CardOptionViewModel[]; highlighted?: CardId; itemTargeting: boolean; pendingCard?: CardOptionViewModel; units: ItemTargetViewModel[]; rerolls: number; onHighlight: (id: CardId) => void; onApply: () => void; onReroll: () => void; onClose: () => void; onEquip: (id: number) => void }) {
  const panelRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | undefined>(undefined)
  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : undefined
    return () => previousFocusRef.current?.focus()
  }, [])
  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus()
  }, [itemTargeting])
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
    if (event.key !== 'Tab' || !panelRef.current) return
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button:not(:disabled)')]
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable.at(-1)!
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  return (
    <div className="card-overlay" role="dialog" aria-modal="true" aria-labelledby="card-dialog-title" onKeyDown={handleKeyDown}>
      <div className="card-overlay__scrim" />
      <section ref={panelRef} className="card-choice-panel">
        <header className="card-choice-header"><div><span className="eyebrow">ROUND {String(round).padStart(2, '0')} / CARD PROTOCOL</span><h2 id="card-dialog-title">{itemTargeting ? '장착 대상을 선택하십시오' : '작전 카드를 선택하십시오'}</h2></div><button className="icon-button" onClick={onClose} aria-label="카드 선택 닫기">×</button></header>
        {itemTargeting ? <><div className="pending-item-summary"><strong>{pendingCard?.title}</strong><span>{pendingCard?.description}</span><small>장착 후 아이템은 교체·제거할 수 없습니다.</small></div><ItemTargetPicker units={units} remaining={remaining} onPick={onEquip} /></> : <><div className="card-grid">{offer.map((card) => <CardOption key={card.id} card={card} selected={highlighted === card.id} onClick={() => onHighlight(card.id)} />)}</div><div className="reroll-row"><div className="reroll-control"><button className="reroll-button" onClick={onReroll} disabled={!rerolls} aria-label={`카드 리롤, ${rerolls}회 남음`}>↻</button><span className="reroll-count" aria-hidden="true">{String(rerolls).padStart(2, '0')}</span></div></div><div className="card-choice-footer"><span>자동 선택까지 {Math.max(0, Math.ceil(remaining ?? 20))}초</span><button className="primary-button" disabled={!highlighted} onClick={onApply}>카드 적용</button></div></>}
      </section>
    </div>
  )
}
