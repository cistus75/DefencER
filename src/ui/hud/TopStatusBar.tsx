export const TopStatusBar = ({ count }: { count: number }) => {
  const stateClass = count >= 50 ? 'stage-topbar--danger' : count >= 40 ? 'stage-topbar--warning' : ''
  return (
    <div className={`stage-topbar ${stateClass}`}>
      <div className="monster-counter">
        <span>필드 적</span><strong>{count}</strong><em>/ 50</em>
      </div>
    </div>
  )
}
