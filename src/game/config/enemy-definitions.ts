import { provisionalBalance as b } from './provisional-balance'
import type { EnemyDefinitionId } from '../domain/common'
import type { EnemyDefinition } from '../domain/enemy'
export const enemyDefinitions: Record<EnemyDefinitionId, EnemyDefinition> = {
  normal: { name: '실험 감염체', asset: '/enemies/placeholder.svg', hp: b.normalHp, speed: b.normalSpeed, reward: 10, size: 28 },
  fast: { name: '고속 감염체', asset: '/enemies/placeholder.svg', hp: b.fastHp, speed: b.fastSpeed, reward: 15, size: 24 },
  alpha: { name: '알파', asset: '/enemies/placeholder.svg', hp: b.alphaHp, speed: b.alphaSpeed, reward: 100, size: 62 },
  omega: { name: '오메가', asset: '/enemies/placeholder.svg', hp: b.omegaHp, speed: b.omegaSpeed, reward: 150, size: 70 },
  gamma: { name: '감마', asset: '/enemies/placeholder.svg', hp: b.gammaHp, speed: b.gammaSpeed, reward: 200, size: 78 },
  wickeline: { name: '위클라인', asset: '/enemies/placeholder.svg', hp: b.wickelineHp, speed: b.wickelineSpeed, reward: 300, size: 88 },
}
