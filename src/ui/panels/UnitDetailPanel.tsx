import type { CSSProperties } from 'react'
import type { UnitDetailViewModel } from '../../game/application/selectors/detail-selectors'

export function UnitDetailPanel({ unit, onDiscard }: { unit?: UnitDetailViewModel; onDiscard: () => void }) {
  if (!unit) return <section className="side-panel detail-panel"><div className="detail-empty"><p>배치된 실험체를 선택하면<br />전투 정보가 표시됩니다.</p></div></section>
  return (
    <section className="side-panel detail-panel detail-panel--selected">
      <header className="detail-header"><div><h2>{unit.name} <small>{unit.star}성</small></h2><span className="role-pill" style={{ '--role-color': unit.color } as CSSProperties}>{unit.role}</span></div><img className="detail-sd" src={unit.asset} alt="" /></header>
      <div className="detail-stats"><div><span>공격력</span><strong>{Math.round(unit.attack)}</strong></div><div><span>사거리</span><strong>{unit.range}</strong></div><div><span>공격 속도</span><strong>{unit.attacksPerSecond.toFixed(2)}</strong></div></div>
      {unit.itemTitle && <div className="detail-item"><span className="eyebrow">장착 아이템</span><strong>{unit.itemTitle}</strong></div>}
      <div className="skill-block"><span className="eyebrow">스킬</span><strong>{unit.skillCooldown}초 자동 발동</strong><p className="skill-description">{unit.skillDescription}</p>{unit.canDiscard && <button className="unit-discard-popover" onClick={onDiscard}>폐기</button>}</div>
    </section>
  )
}
