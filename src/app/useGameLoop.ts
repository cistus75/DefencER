import { useEffect } from 'react'
import type { GameAction } from '../game/application/game-action'
import type { Phase } from '../game/domain/common'

const fixedStep = 1 / 60

export const useGameLoop = (phase: Phase, dispatch: (action: GameAction) => void) => useEffect(() => {
  if (phase !== 'combat') return
  let frame = 0
  let last = performance.now()
  let accumulator = 0
  const loop = (now: number) => {
    accumulator += Math.min(0.1, (now - last) / 1000)
    last = now
    while (accumulator >= fixedStep) {
      dispatch({ type: 'TICK', delta: fixedStep })
      accumulator -= fixedStep
    }
    frame = requestAnimationFrame(loop)
  }
  frame = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(frame)
}, [phase, dispatch])
