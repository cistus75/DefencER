import type { Projectile } from '../../game/domain/projectile'
export const ProjectileLayer=({projectiles}:{projectiles:Projectile[]})=><div className="projectile-layer">{projectiles.map(p=><i key={p.id} className={`projectile projectile--${p.kind}`} style={{transform:`translate(${p.position.x}px,${p.position.y}px)`}}/>)}</div>
