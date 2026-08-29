import type { RunState } from '../domain/run-state'
import { enemyDefinitions } from '../config/enemy-definitions'
import { trackLength } from '../config/battlefield-config'
export const moveEnemies=(run:RunState,delta:number):RunState=>({...run,enemies:run.enemies.map(e=>{const speed=enemyDefinitions[e.definitionId].speed;return {...e,trackDistance:(e.trackDistance+speed*delta)%trackLength,travelledDistance:e.travelledDistance+speed*delta}})})
