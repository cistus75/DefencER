import type { CardId, EnemyDefinitionId, UnitDefinitionId } from '../../domain/common'
import type { GameConfig } from '../../domain/game-config'
import type { RunState } from '../../domain/run-state'
import { effectiveRange } from '../../domain/rules/stat-rules'

export type BoardUnitViewModel = {
  id: number
  definitionId: UnitDefinitionId
  slot: number
  star: 1 | 2 | 3 | 4 | 5
  item?: CardId
  name: string
  asset: string
  color: string
  markCount: number
  skillProgress: number
  attackCooldown: number
  actionLock: number
  markDurations: number[]
  rangeRadius: number
  centerX: number
  centerY: number
}

export type PlacementSlotViewModel = { slot: number; x: number; y: number; points: string }
export type EnemyActorViewModel = { id: number; definitionId: EnemyDefinitionId; name?: string; asset?: string; x: number; y: number; radius: number; hpRatio: number }
export type ProjectileActorViewModel = { id: number; kind: 'basic' | 'skill' | 'support'; x: number; y: number }

export const placementSlotsViewModel = (config: GameConfig): PlacementSlotViewModel[] => config.battlefield.placementSlots
export const enemyActorsViewModel = (run: RunState, config: GameConfig): EnemyActorViewModel[] => run.enemies.map((enemy) => { const point = config.battlefield.pointOnTrack(enemy.trackDistance); const definition = config.enemies[enemy.definitionId]; return { id: enemy.id, definitionId: enemy.definitionId, name: definition.name, asset: definition.asset, x: point.x, y: point.y, radius: definition.size / 2, hpRatio: Math.max(0, enemy.hp / enemy.maxHp) } })
export const projectileActorsViewModel = (run: RunState): ProjectileActorViewModel[] => run.projectiles.map((projectile) => ({ id: projectile.id, kind: projectile.kind, x: projectile.position.x, y: projectile.position.y }))

export const boardViewModel = (run: RunState, config: GameConfig): BoardUnitViewModel[] => run.units.map((unit) => {
  const definition = config.units[unit.definitionId]
  return {
    id: unit.id,
    definitionId: unit.definitionId,
    slot: unit.slot,
    star: unit.star,
    item: unit.item,
    name: definition.name,
    asset: definition.asset,
    color: definition.color,
    markCount: unit.marks.length,
    skillProgress: Math.max(0, 1 - unit.skillCooldown / definition.skillCooldown),
    attackCooldown: unit.attackCooldown,
    actionLock: unit.actionLock,
    markDurations: unit.marks.map((mark) => mark.remaining),
    rangeRadius: effectiveRange(definition, unit.item, run.activeRuleEffects) * config.balance.rangePixels,
    centerX: config.battlefield.slotCenter(unit.slot).x,
    centerY: config.battlefield.slotCenter(unit.slot).y,
  }
})
