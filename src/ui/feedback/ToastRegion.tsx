import { useEffect, useRef } from 'react'

type ToastViewModel = { id: number; message: string }

export const ToastRegion = ({ notification, onAcknowledge }: { notification?: ToastViewModel; onAcknowledge: () => void }) => {
  const acknowledgeRef = useRef(onAcknowledge)
  acknowledgeRef.current = onAcknowledge

  useEffect(() => {
    if (!notification) return
    const timeout = window.setTimeout(() => acknowledgeRef.current(), 3400)
    return () => window.clearTimeout(timeout)
  }, [notification?.id])

  return <div key={notification?.id} className="toast" data-visible={Boolean(notification)} aria-live="polite">{notification?.message}</div>
}
