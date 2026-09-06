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
  supportSummary?: string
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
    range: effectiveRange(definition, unit.item, run.activeRuleEffects),
    attacksPerSecond: effectiveAps(definition, unit.item, run.activeRuleEffects),
    skillCooldown: definition.skillCooldown,
    skillDescription: definition.skillId === 'hyunwoo-strike' ? '선두 필드 적에게 강한 단일 공격을 가합니다.' : definition.skillId === 'rio-barrage' ? '선두 필드 적에게 연속 공격을 가합니다.' : definition.skillId === 'adina-area' ? '선두 필드 적과 주변 적에게 범위 공격을 가합니다.' : '사거리 안 비서포터에게 4초 곰돌이 표식을 부여합니다.',
    itemTitle: unit.item ? config.cards[unit.item].title : undefined,
    canDiscard: (run.phase === 'ready' || run.phase === 'combat') && !unit.item && unit.star < 5,
    supportSummary: unit.marks.length ? `곰돌이 표식 ${unit.marks.length}개 · 현재 효율 ${Math.round(Math.min(0.8, 1 - unit.marks.reduce((value, mark) => value * (1 - mark.ratio), 1)) * 100)}% · ${Math.ceil(Math.min(...unit.marks.map((mark) => mark.remaining)))}초 남음` : undefined,
  }
}
