export type RandomGenerator = { next(seed: number): { value: number; seed: number } }
