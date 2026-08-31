import type { CardHistoryViewModel } from '../../game/application/selectors/card-selectors'
import { Icon } from '../shared/Icon'

export function CardHistoryPanel({ cards, rerolls }: { cards: CardHistoryViewModel[]; rerolls: number }) {
  return (
    <aside className="side-panel rule-history">
      <header className="panel-header panel-header--brand"><div className="brand-line"><span className="brand-mark">+</span><strong>DefencER</strong></div></header>
      <div className="history-heading"><strong>카드 기록</strong></div>
      <div className="rule-list">{cards.length === 0 ? <p className="empty-history">아직 선택한 카드가 없습니다.</p> : cards.map((card, index) => <article className={`rule-card ${index === 0 ? 'rule-card--active' : ''}`} key={`${card.id}-${index}`}><div className="rule-card__icon"><Icon name={card.kind === '규칙' ? 'strategy' : 'item'} /></div><div className="rule-card__copy"><span className="rule-card__type">{card.kind} · ROUND {String(card.round).padStart(2, '0')}</span><strong>{card.title}</strong><p>{card.description}</p></div></article>)}</div>
      <div className="left-status"><div className="status-row"><span>다음 카드 선택</span><strong>ROUND 05</strong></div><div className="status-row"><span>리롤 보유</span><strong className="status-row__gold">{String(rerolls).padStart(2, '0')}</strong></div></div>
    </aside>
  )
}
