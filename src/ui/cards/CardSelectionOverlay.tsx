import { useEffect, useRef } from 'react'
import type { CardOptionViewModel, ItemTargetViewModel } from '../../game/application/selectors/card-selectors'
import type { CardId } from '../../game/domain/common'
import { CardOption } from './CardOption'
import { ItemTargetPicker } from './ItemTargetPicker'

export function CardSelectionOverlay({ offer, highlighted, itemTargeting, units, rerolls, onHighlight, onApply, onReroll, onClose, onEquip }: { offer: CardOptionViewModel[]; highlighted?: CardId; itemTargeting: boolean; units: ItemTargetViewModel[]; rerolls: number; onHighlight: (id: CardId) => void; onApply: () => void; onReroll: () => void; onClose: () => void; onEquip: (id: number) => void }) {
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
        <header className="card-choice-header"><div><span className="eyebrow">ROUND 05 · CHOOSE ONE</span><h2 id="card-dialog-title">{itemTargeting ? '장착 대상을 선택하십시오' : '작전 카드를 선택하십시오'}</h2></div><button className="icon-button" onClick={onClose} aria-label="카드 선택 닫기">×</button></header>
        {itemTargeting ? <ItemTargetPicker units={units} onPick={onEquip} /> : <><div className="card-grid">{offer.map((card) => <CardOption key={card.id} card={card} selected={highlighted === card.id} onClick={() => onHighlight(card.id)} />)}</div><div className="reroll-row"><button className="reroll-button" onClick={onReroll} disabled={!rerolls} aria-label={`카드 리롤, ${rerolls}회 남음`}>↻<b>{String(rerolls).padStart(2, '0')}</b></button></div><div className="card-choice-footer"><span>선택 대기 중 · 제한 시간 없음</span><button className="primary-button" disabled={!highlighted} onClick={onApply}>카드 적용</button></div></>}
      </section>
    </div>
  )
}
