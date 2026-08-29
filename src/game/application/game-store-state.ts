import type { RunState } from '../domain/run-state'
import type { Notification } from './notification'
export type GameStoreState = { run: RunState; notifications: Notification[] }
