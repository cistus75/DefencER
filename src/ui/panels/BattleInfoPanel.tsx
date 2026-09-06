import type { BattleInfoViewModel } from '../../game/application/selectors/hud-selectors'
import { seconds } from '../shared/format'

export const BattleInfoPanel = ({ viewModel, onStart, onSkip, onOpenCards }: { viewModel: BattleInfoViewModel; onStart: () => void; onSkip: () => void; onOpenCards: () => void }) => {
  const action = viewModel.action === 'start' ? { label: '전투 시작', onClick: onStart } : viewModel.action === 'skip' ? { label: '라운드 스킵', onClick: onSkip } : viewModel.action === 'cards' ? { label: '카드 선택 열기', onClick: onOpenCards } : undefined
  return (
    <section className="side-panel battle-info" aria-label="실험 현황">
      <header className="panel-header"><div><strong>실험 현황</strong><span>EXPERIMENT STATUS</span></div></header>
      <div className="round-readout"><div><span className="eyebrow">CURRENT TRIAL</span><div className="round-number"><strong>{String(viewModel.round).padStart(2, '0')}</strong><em>/ 40</em></div></div><div className="timer"><strong>{seconds(viewModel.remaining)}</strong><span>{viewModel.phaseLabel}</span></div></div>
      <div className="wave-brief"><span>{viewModel.boss ? '보스 개체' : '예상 출현'}</span><strong>{viewModel.threatName}</strong><em>{viewModel.incoming} 개체</em></div>
      {action && <button className="secondary-button panel-action-button" onClick={action.onClick}>{action.label}</button>}
    </section>
  )
}
