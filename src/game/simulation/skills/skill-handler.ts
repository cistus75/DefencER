import type { Vec2 } from '../../domain/common'
import type { EnemyInstance } from '../../domain/enemy'
import type { Projectile } from '../../domain/projectile'
import type { RunState } from '../../domain/run-state'
import type { UnitDefinition, UnitInstance } from '../../domain/unit'
import type { SimulationContext } from '../simulation-context'

export type SkillInput = { run: RunState; context: SimulationContext; units: UnitInstance[]; unit: UnitInstance; definition: UnitDefinition; target?: EnemyInstance; attack: number; origin: Vec2; projectileCounter: number; randomSeed: number }
export type SkillResult = { units: UnitInstance[]; projectiles: Projectile[]; projectileCounter: number; randomSeed: number; activated: boolean }
export type SkillHandler = (input: SkillInput) => SkillResult
export const inactiveSkill = (input: SkillInput): SkillResult => ({ units: input.units, projectiles: [], projectileCounter: input.projectileCounter, randomSeed: input.randomSeed, activated: false })
