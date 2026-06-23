import { useEffect } from 'react'

interface BacklogToastProps {
  message: string | null
  type?: 'error' | 'success' | 'info'
  onClear: () => void
}

export function BacklogToast({ message, type = 'info', onClear }: BacklogToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClear, 4000)
    return () => clearTimeout(timer)
  }, [message, onClear])

  if (!message) return null

  return (
    <div className={`backlog-toast backlog-toast--${type}`} role="status">
      {message}
    </div>
  )
}
