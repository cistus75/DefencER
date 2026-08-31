import type { CSSProperties } from 'react'
import type { EnemyActorViewModel } from '../../game/application/selectors/board-selectors'

export const EnemyLayer = ({ enemies }: { enemies: EnemyActorViewModel[] }) => (
  <svg className="enemy-layer" viewBox="0 0 1374 1145" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <foreignObject width="1374" height="1145">
      <div className="actor-coordinate-space">
        {enemies.map((enemy) => {
          const diameter = enemy.radius * 2
          return (
            <div key={enemy.id} className={`enemy enemy--${enemy.definitionId}`} style={{ width: diameter, height: diameter, transform: `translate3d(${enemy.x - enemy.radius}px, ${enemy.y - enemy.radius}px, 0)` } as CSSProperties}>
              <span className="enemy-health-track"><i className="enemy-health-value" style={{ width: `${enemy.hpRatio * 100}%` }} /></span>
            </div>
          )
        })}
      </div>
    </foreignObject>
  </svg>
)
