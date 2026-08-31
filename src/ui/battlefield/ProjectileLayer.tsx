import type { ProjectileActorViewModel } from '../../game/application/selectors/board-selectors'
export const ProjectileLayer = ({ projectiles }: { projectiles: ProjectileActorViewModel[] }) => (
  <svg className="projectile-layer" viewBox="0 0 1374 1145" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <foreignObject width="1374" height="1145">
      <div className="actor-coordinate-space">
        {projectiles.map((projectile) => <div key={projectile.id} className={`projectile projectile--${projectile.kind}`} style={{ transform: `translate3d(${projectile.x - 4}px, ${projectile.y - 4}px, 0)` }} />)}
      </div>
    </foreignObject>
  </svg>
)
