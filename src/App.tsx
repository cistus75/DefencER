const rules = [
  { title: '급속 성장', desc: '모든 아군의 공격 속도 +12%', tag: '전투' },
  { title: '고위험 계약', desc: '적 체력 +18%, 획득 크레딧 +25%', tag: '규칙' },
  { title: '냉각 순환', desc: '스킬 재사용 대기시간 -8%', tag: '유틸' },
]

function RuleCard({ title, desc, tag }: { title: string; desc: string; tag: string }) {
  return (
    <article className="rule-card">
      <div className="rule-card__header">
        <span className="rule-card__icon">◇</span>
        <span className="rule-card__tag">{tag}</span>
      </div>
      <strong>{title}</strong>
      <p>{desc}</p>
    </article>
  )
}

function App() {
  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">D</span>
          <div>
            <strong>DefencER</strong>
            <span>ETERNAL DEFENSE PROTOCOL</span>
          </div>
        </div>

        <div className="battle-status">
          <div className="status-block">
            <span>WAVE</span>
            <strong>07</strong>
            <small>/ 40</small>
          </div>
          <div className="status-divider" />
          <div className="status-block status-block--enemy">
            <span>REMAIN</span>
            <strong>18</strong>
            <small>ENEMIES</small>
          </div>
        </div>

        <button className="icon-button" aria-label="Settings">⌁</button>
      </header>

      <section className="game-layout">
        <aside className="left-panel hud-panel">
          <div className="panel-title">
            <span>SPECIAL RULES</span>
            <strong>특수 규칙</strong>
          </div>
          <div className="rules-list">
            {rules.map((rule) => <RuleCard key={rule.title} {...rule} />)}
          </div>
        </aside>

        <section className="battlefield-wrap">
          <div className="battlefield">
            <div className="ambient-grid" />
            <div className="arena-ring arena-ring--outer" />
            <div className="arena-ring arena-ring--inner" />
            <div className="core">
              <span>CORE</span>
              <strong>100%</strong>
            </div>

            <div className="unit unit--1">1★</div>
            <div className="unit unit--2">2★</div>
            <div className="unit unit--3">1★</div>
            <div className="enemy enemy--1" />
            <div className="enemy enemy--2" />
            <div className="enemy enemy--3" />
            <div className="enemy enemy--4" />

            <div className="battlefield-label">
              <span>SECTOR 01</span>
              <strong>ABANDONED RESEARCH ZONE</strong>
            </div>
          </div>

          <div className="bottom-hud">
            <button className="summon-button">
              <span className="summon-button__icon">＋</span>
              <span>
                <small>RANDOM UNIT</small>
                <strong>소환</strong>
              </span>
            </button>
            <div className="credit-box">
              <span className="credit-icon">C</span>
              <div>
                <small>CREDIT</small>
                <strong>1,840</strong>
              </div>
              <span className="credit-cost">- 100</span>
            </div>
          </div>
        </section>

        <aside className="right-panel hud-panel">
          <div className="wave-card">
            <div>
              <span>CURRENT WAVE</span>
              <strong>07</strong>
            </div>
            <div className="wave-card__remaining">
              <span>남은 적</span>
              <strong>18</strong>
            </div>
            <div className="wave-progress"><span style={{ width: '58%' }} /></div>
          </div>

          <div className="detail-panel">
            <div className="panel-title panel-title--compact">
              <span>INFORMATION</span>
              <strong>상세 정보</strong>
            </div>
            <div className="empty-detail">
              <div className="empty-detail__reticle">＋</div>
              <strong>대상을 선택하세요</strong>
              <p>캐릭터, 아이템 또는 카드를 선택하면 상세 정보가 표시됩니다.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
