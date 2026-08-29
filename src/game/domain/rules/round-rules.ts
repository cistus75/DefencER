export const roundDefinition = (round: number) => round === 10 ? { kind: 'boss' as const, total: 1, duration: 60 } : { kind: 'normal' as const, total: round + 4, duration: 30 }
