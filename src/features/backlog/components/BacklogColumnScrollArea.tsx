import { ChevronDown, ChevronUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'

const SCROLL_STEP = 280

interface BacklogColumnScrollAreaProps {
  children: ReactNode
  className?: string
}

export function BacklogColumnScrollArea({
  children,
  className = '',
}: BacklogColumnScrollAreaProps) {
  const { t } = useLanguage()
  const d = t.backlog
  const viewportRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const overflow = scrollHeight - clientHeight > 8
    setCanScrollUp(overflow && scrollTop > 4)
    setCanScrollDown(overflow && scrollTop + clientHeight < scrollHeight - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = viewportRef.current
    if (!el) return

    el.addEventListener('scroll', updateScrollState, { passive: true })
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    }
  }, [updateScrollState, children])

  function scrollBy(direction: 'up' | 'down') {
    viewportRef.current?.scrollBy({
      top: direction === 'up' ? -SCROLL_STEP : SCROLL_STEP,
      behavior: 'smooth',
    })
  }

  return (
    <div className={`backlog-column-scroll${className ? ` ${className}` : ''}`}>
      <div className="backlog-column-scroll__wrap">
        {canScrollUp && (
          <div
            className="backlog-column-scroll__fade backlog-column-scroll__fade--top"
            aria-hidden="true"
          />
        )}
        {canScrollDown && (
          <div
            className="backlog-column-scroll__fade backlog-column-scroll__fade--bottom"
            aria-hidden="true"
          />
        )}

        {canScrollUp && (
          <button
            type="button"
            className="backlog-column-scroll__arrow backlog-column-scroll__arrow--top"
            aria-label={d.scrollUp}
            onClick={() => scrollBy('up')}
          >
            <ChevronUp size={22} strokeWidth={2} />
          </button>
        )}

        {canScrollDown && (
          <button
            type="button"
            className="backlog-column-scroll__arrow backlog-column-scroll__arrow--bottom"
            aria-label={d.scrollDown}
            onClick={() => scrollBy('down')}
          >
            <ChevronDown size={22} strokeWidth={2} />
          </button>
        )}

        <div ref={viewportRef} className="backlog-column-scroll__viewport">
          {children}
        </div>
      </div>
    </div>
  )
}
