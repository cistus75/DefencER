import type { GameConfig } from '../../domain/game-config'
import type { RunState } from '../../domain/run-state'
import { effectiveAps, effectiveAttack, effectiveRange } from '../../domain/rules/stat-rules'

export type UnitDetailViewModel = {
  id: number
  name: string
  star: number
  role: string
  color: string
  asset: string
  attack: number
  range: number
  attacksPerSecond: number
  skillCooldown: number
  skillDescription: string
  itemTitle?: string
  canDiscard: boolean
}

export const selectedUnitViewModel = (run: RunState, config: GameConfig, id?: number): UnitDetailViewModel | undefined => {
  const unit = id === undefined ? undefined : run.units.find((candidate) => candidate.id === id)
  if (!unit) return undefined
  const definition = config.units[unit.definitionId]
  return {
    id: unit.id,
    name: definition.name,
    star: unit.star,
    role: definition.role,
    color: definition.color,
    asset: definition.asset,
    attack: effectiveAttack(definition, unit.star, unit.item, run.activeRuleEffects, unit.slot),
    range: effectiveRange(definition, unit.item),
    attacksPerSecond: effectiveAps(definition, unit.item),
    skillCooldown: definition.skillCooldown,
    skillDescription: definition.role === '서포터' ? '사거리 안 비서포터에게 곰돌이 표식을 부여합니다.' : '사거리 안의 선두 필드 적을 자동 공격합니다.',
    itemTitle: unit.item ? config.cards[unit.item].title : undefined,
    canDiscard: !unit.item && unit.star < 5,
  }
}
