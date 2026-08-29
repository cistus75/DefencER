import type { RandomGenerator } from '../domain/ports/random-generator'
export const seededRandomGenerator: RandomGenerator = { next(seed) { let value = seed || 0x9e3779b9; value ^= value << 13; value ^= value >>> 17; value ^= value << 5; return { value: (value >>> 0) / 4294967296, seed: value >>> 0 } } }
