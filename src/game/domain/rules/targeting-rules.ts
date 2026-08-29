import type { EnemyInstance } from '../enemy'
import type { Vec2 } from '../common'
export const chooseTarget = (enemies: EnemyInstance[], origin: Vec2, range: number, enemyPosition: (enemy: EnemyInstance) => Vec2) => enemies.filter((enemy) => { const p = enemyPosition(enemy); return !enemy.dead && Math.hypot(p.x-origin.x,p.y-origin.y) <= range * 150 }).sort((a,b) => (a.definitionId === 'alpha' ? -1 : b.definitionId === 'alpha' ? 1 : b.travelledDistance - a.travelledDistance || a.id - b.id))[0]
