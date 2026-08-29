import type { Notification } from '../../game/application/notification'
export const ToastRegion=({notification}:{notification?:Notification})=><div className="toast" data-visible={Boolean(notification)} aria-live="polite">{notification?.message}</div>
