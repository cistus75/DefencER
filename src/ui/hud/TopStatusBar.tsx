export const TopStatusBar = ({ count, state = '관측 중' }: { count: number; state?: string }) => {
  const stateClass = count >= 50 ? 'stage-topbar--danger' : count >= 40 ? 'stage-topbar--warning' : ''
  return (
    <div className={`stage-topbar ${stateClass}`}>
      <div className="stage-topbar__lab" aria-label="AGLAIA 방어 실험">
        <strong>AGLAIA</strong>
        <span>DEFENSE TRIAL</span>
      </div>
      <div className="monster-counter">
        <span>필드 적</span><strong>{count}</strong><em>/ 50</em>
      </div>
      <div className="stage-topbar__state"><span>{state}</span></div>
    </div>
  )
}
