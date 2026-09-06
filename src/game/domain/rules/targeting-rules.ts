import type { EnemyInstance } from '../enemy'
import type { Vec2 } from '../common'
const isBoss = (enemy: EnemyInstance) => enemy.definitionId !== 'normal' && enemy.definitionId !== 'fast'

export const chooseTarget = (enemies: EnemyInstance[], origin: Vec2, range: number, enemyPosition: (enemy: EnemyInstance) => Vec2, rangePixels = 150) => enemies.filter((enemy) => { const p = enemyPosition(enemy); return !enemy.dead && Math.hypot(p.x-origin.x,p.y-origin.y) <= range * rangePixels }).sort((a,b) => (isBoss(a) ? -1 : isBoss(b) ? 1 : b.travelledDistance - a.travelledDistance || a.id - b.id))[0]
