import type { Phase } from '../../domain/common'
import type { RunState } from '../../domain/run-state'
import type { GameConfig } from '../../domain/game-config'
import { cloneCost } from '../../domain/rules/economy-rules'
import { resultCardTitles } from './card-selectors'
import { notificationMessage, type Notification } from '../notification'

export type BattleInfoViewModel = { round: number; remaining: number; phaseLabel: string; threatName: string; incoming: number; boss: boolean; action?: 'start' | 'skip' | 'cards' }
export type ResultViewModel = { visible: boolean; victory: boolean; title: string; description: string; round: number; cloneCount: number; credits: number; cards: string[] }

export const hudViewModel = (run: RunState) => ({ credits: run.credits, currentCost: cloneCost(run.successfulCloneCount), nextCost: cloneCost(run.successfulCloneCount + 1), enemyCount: run.enemies.length, freeCloneTickets: run.freeCloneTickets })

export const battleInfoViewModel = (run: RunState, config: GameConfig): BattleInfoViewModel => {
  const definition = config.roundDefinition(run.round.number)
  return {
    round: run.round.number,
    remaining: run.round.remaining,
    phaseLabel: run.phase === 'ready' ? '전투 준비' : run.phase === 'card-selection' || run.phase === 'item-targeting' ? '카드 선택 중' : '남은 시간',
    threatName: definition.bossId ? config.enemies[definition.bossId].name : run.round.number >= 31 ? '최고 위험도 군집' : run.round.number >= 21 ? '고위험 군집' : run.round.number >= 11 ? '강화 군집' : '감염체 군집',
    incoming: definition.total,
    boss: definition.kind === 'boss',
    action: run.phase === 'ready' ? 'start' : run.phase === 'combat' && run.enemies.length === 0 && run.pendingSpawns === 0 ? 'skip' : run.phase === 'card-selection' || run.phase === 'item-targeting' ? 'cards' : undefined,
  }
}

export const nextCardRound = (run: RunState) => {
  if (run.phase === 'card-selection' || run.phase === 'item-targeting') return run.round.number
  const next = Math.ceil((run.round.number + 1) / 5) * 5
  return next < 40 ? next : undefined
}

export const resultViewModel = (run: RunState, config: GameConfig): ResultViewModel => ({
  visible: run.phase === 'victory' || run.phase === 'defeat',
  victory: run.phase === 'victory',
  title: run.phase === 'victory' ? '실험 완료 / 위클라인 처치' : run.result === 'overflow' ? '방어 한계 초과' : `${config.enemies[config.roundDefinition(run.round.number).bossId ?? 'wickeline'].name} 제압 실패`,
  description: run.result === 'overflow' ? '필드 적이 50마리에 도달했습니다.' : run.result === 'timeout' ? '제한 시간 안에 보스를 처치하지 못했습니다.' : '40라운드 방어 실험을 완료했습니다.',
  round: run.round.number,
  cloneCount: run.successfulCloneCount,
  credits: run.credits,
  cards: resultCardTitles(run, config),
})

export const boardInteractionEnabled = (phase: Phase) => phase === 'ready' || phase === 'combat'
export const notificationViewModel = (notification?: Notification) => notification && ({ id: notification.id, message: notificationMessage(notification.code, notification.payload) })
