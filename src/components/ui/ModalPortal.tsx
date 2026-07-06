import { createPortal } from 'react-dom'
import { useEffect, type ReactNode } from 'react'

interface ModalPortalProps {
  children: ReactNode
  onEscape?: () => void
}

export function ModalPortal({ children, onEscape }: ModalPortalProps) {
  useEffect(() => {
    if (!onEscape) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onEscape?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onEscape])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return createPortal(children, document.body)
}
