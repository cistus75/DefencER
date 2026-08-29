import type { Vec2 } from './common'
export type Projectile = { id: number; sourceId: number; targetId: number; kind: 'basic'|'skill'|'support'; damage: number; speed: number; delay: number; areaRadius?: number; position: Vec2; supports?: number[] }
