import { provisionalBalance as b } from './provisional-balance'
import type { EnemyDefinitionId } from '../domain/common'
import type { EnemyDefinition } from '../domain/enemy'
export const enemyDefinitions: Record<EnemyDefinitionId, EnemyDefinition> = { normal:{hp:b.normalHp,speed:b.normalSpeed,reward:10,size:24}, fast:{hp:b.fastHp,speed:b.fastSpeed,reward:15,size:20}, alpha:{hp:b.alphaHp,speed:b.alphaSpeed,reward:100,size:56} }
