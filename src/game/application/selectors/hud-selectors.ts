import type { RunState } from '../../domain/run-state'
import { cloneCost } from '../../domain/rules/economy-rules'
export const hudViewModel=(run:RunState)=>({credits:run.credits,currentCost:cloneCost(run.successfulCloneCount),nextCost:cloneCost(run.successfulCloneCount+1),enemyCount:run.enemies.length,time:run.round.remaining})
