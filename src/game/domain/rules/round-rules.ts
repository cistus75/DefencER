import type { EnemyDefinitionId } from '../common'
import type { RoundDefinition } from '../game-config'

const bosses: Partial<Record<number, EnemyDefinitionId>> = {
  10: 'alpha',
  20: 'omega',
  30: 'gamma',
  40: 'wickeline',
}

const normalEnemyCount = (round: number) => {
  if (round < 10) return round + 4
  if (round < 20) return 15 + (round - 11) * 2
  if (round < 30) return 34 + (round - 21) * 3
  return 62 + (round - 31) * 4
}

export const roundDefinition = (round: number): RoundDefinition => {
  const bossId = bosses[round]
  return bossId
    ? { kind: 'boss', total: 1, duration: 60, bossId }
    : { kind: 'normal', total: normalEnemyCount(round), duration: 30 }
}
