import battlefieldSvg from './assets/battlefield.svg'

const ruleCards = [
  { roman: 'I', title: '무제한 소환 I', desc: '소환 제한이 사라집니다.' },
  { roman: 'II', title: '강화 적 출현 I', desc: '모든 적의 최대 체력이 15% 증가합니다.' },
  { roman: 'III', title: '시작 자금 증가 I', desc: '시작 크레딧이 150 증가합니다.' },
  { roman: 'IV', title: '공격 속도 증가 I', desc: '모든 아군의 공격 속도가 10% 증가합니다.' },
  { roman: 'V', title: '회복 효과 감소 I', desc: '적의 모든 회복 효과가 20% 감소합니다.' },
  { roman: 'VI', title: '카드 강화 확률 증가 I', desc: '카드 강화 성공 확률이 10% 증가합니다.' },
]

const enemies = [
  { x: 19, y: 18, tone: 'red' },
  { x: 31, y: 18, tone: 'orange' },
  { x: 43, y: 18, tone: 'red' },
  { x: 56, y: 18, tone: 'purple' },
  { x: 69, y: 18, tone: 'red' },
  { x: 82, y: 18, tone: 'purple' },
  { x: 88, y: 33, tone: 'orange' },
  { x: 89, y: 49, tone: 'red' },
  { x: 89, y: 65, tone: 'purple' },
  { x: 80, y: 80, tone: 'red' },
  { x: 67, y: 80, tone: 'orange' },
  { x: 54, y: 80, tone: 'red' },
  { x: 41, y: 80, tone: 'purple' },
  { x: 28, y: 80, tone: 'orange' },
  { x: 12, y: 65, tone: 'red' },
  { x: 12, y: 49, tone: 'purple' },
  { x: 12, y: 33, tone: 'orange' },
]

function CreditToken() {
  return <span className="credit-token" aria-hidden="true"><i /></span>
}

function RuleCard({ roman, title, desc }: (typeof ruleCards)[number]) {
  return (
    <article className="rule-card">
      <span className="rule-card__roman">{roman}</span>
      <div className="rule-card__copy">
        <strong>{title}</strong>
        <p>{desc}</p>
      </div>
    </article>
  )
}

function Battlefield() {
  return (
    <div className="battlefield battlefield--svg">
      <img className="battlefield-art" src={battlefieldSvg} alt="" aria-hidden="true" />
      <div className="battlefield-actors">
        {enemies.map((enemy, index) => (
          <div
            key={index}
            className={`enemy-dot enemy-dot--${enemy.tone}`}
            style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
          >
            <span />
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <main className="game-shell">
      <aside className="side-panel rule-history">
        <header className="panel-header">
          <strong>카드</strong>
          <span>CARD</span>
        </header>
        <div className="rule-list">
          {ruleCards.map((rule) => <RuleCard key={rule.roman} {...rule} />)}
        </div>
      </aside>

      <section className="center-stage">
        <div className="monster-counter">몬스터 <strong>28</strong> / 50</div>
        <Battlefield />

        <div className="bottom-actions">
          <button className="summon-button">
            <strong>소환</strong>
            <span className="summon-cost"><CreditToken />20</span>
          </button>

          <div className="credit-box">
            <span>크레딧</span>
            <strong><CreditToken />350</strong>
          </div>
        </div>
      </section>

      <aside className="right-column">
        <section className="side-panel battle-info">
          <header className="panel-header">
            <strong>전투 정보</strong>
            <span>BATTLE INFO</span>
          </header>

          <div className="info-block">
            <span>웨이브</span>
            <div className="wave-number"><strong>12</strong><em>/ 40</em></div>
          </div>
          <div className="info-row">
            <span>남은 적</span>
            <strong>● 28</strong>
          </div>
        </section>

        <section className="side-panel detail-panel">
          <div className="detail-empty">
            <div className="detail-mark">◇</div>
            <p>카드, 캐릭터, 아이템을<br />선택하면 정보가 표시됩니다.</p>
          </div>
        </section>
      </aside>
    </main>
  )
}

export default App
