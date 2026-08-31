import { useEffect, useRef } from 'react'
import type { ResultViewModel } from '../../game/application/selectors/hud-selectors'

export const RunResultOverlay = ({ result, onReset }: { result: ResultViewModel; onReset: () => void }) => {
  const resetRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (result.visible) resetRef.current?.focus() }, [result.visible])
  if (!result.visible) return null
  return (
    <div className="result-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title" onKeyDown={(event) => { if (event.key === 'Tab') { event.preventDefault(); resetRef.current?.focus() } }}>
      <section><span className="eyebrow">RUN RESULT</span><h1 id="result-title">{result.title}</h1><p>{result.description}</p><dl><div><dt>도달 라운드</dt><dd>{result.round}</dd></div><div><dt>복제 횟수</dt><dd>{result.cloneCount}</dd></div><div><dt>남은 크레딧</dt><dd>{result.credits}</dd></div></dl><div className="result-cards"><span>선택 카드</span>{result.cards.length ? <ul>{result.cards.map((title) => <li key={title}>{title}</li>)}</ul> : <strong>없음</strong>}</div><button ref={resetRef} className="primary-button" onClick={onReset}>새 런 시작</button></section>
    </div>
  )
}
