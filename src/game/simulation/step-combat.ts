import type { RunState } from '../domain/run-state'
import { provisionalBalance as b } from '../config/provisional-balance'
import { spawnEnemies } from './spawn-system'
import { moveEnemies } from './enemy-movement-system'
import { actUnits } from './unit-action-system'
import { moveProjectiles } from './projectile-system'
import { resolveRound } from './round-resolution-system'
export const stepCombat=(input:RunState,delta=b.fixedStep):RunState=>{let run={...input,round:{...input.round,remaining:Math.max(0,input.round.remaining-delta)},units:input.units.map(u=>({...u,actionLock:Math.max(0,u.actionLock-delta),attackCooldown:Math.max(0,u.attackCooldown-delta),skillCooldown:Math.max(0,u.skillCooldown-delta),marks:u.marks.map(m=>({...m,remaining:Math.max(0,m.remaining-delta)})).filter(m=>m.remaining>0)})),projectiles:input.projectiles.map(p=>({...p,delay:Math.max(0,p.delay-delta)}))};run=spawnEnemies(run,delta);if(run.enemies.length>=50)return {...run,phase:'defeat',result:'overflow'};run=moveEnemies(run,delta);run=actUnits(run);run=moveProjectiles(run,delta);return resolveRound(run)}
