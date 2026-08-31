import type { SkillId } from '../../domain/common'
import { adinaSkill } from './adina-skill'
import { hyunwooSkill } from './hyunwoo-skill'
import { leniSkill } from './leni-skill'
import { rioSkill } from './rio-skill'
import type { SkillHandler } from './skill-handler'

export const skillRegistry: Record<SkillId, SkillHandler> = { 'hyunwoo-strike': hyunwooSkill, 'rio-barrage': rioSkill, 'adina-area': adinaSkill, 'leni-mark': leniSkill }
