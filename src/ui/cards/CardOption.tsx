import type { CSSProperties } from 'react'
import type { CardOptionViewModel } from '../../game/application/selectors/card-selectors'
import { Icon } from '../shared/Icon'

export const CardOption = ({ card, selected, onClick }: { card: CardOptionViewModel; selected?: boolean; onClick: () => void }) => <button className={`choice-card ${selected ? 'choice-card--selected' : ''}`} style={{ '--card-accent': card.accent } as CSSProperties} onClick={onClick} aria-pressed={selected}><div className="choice-card__top"><span className="choice-card__type">{card.kind}</span></div><div className="choice-card__icon"><Icon name={card.kind === '규칙' ? 'strategy' : 'item'} /></div><div className="choice-card__body"><strong>{card.title}</strong><span>{card.subtitle}</span><p>{card.description}</p></div></button>
