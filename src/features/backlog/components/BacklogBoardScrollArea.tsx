import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'

const SCROLL_STEP = 420

interface BacklogBoardScrollAreaProps {
  children: ReactNode
  hidden?: boolean
  showHint?: boolean
  className?: string
}

export function BacklogBoardScrollArea({
  children,
  hidden = false,
  showHint = true,
  className = '',
}: BacklogBoardScrollAreaProps) {
  const { t } = useLanguage()
  const d = t.backlog
  const viewportRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflow = scrollWidth - clientWidth > 8
    setCanScrollLeft(overflow && scrollLeft > 4)
    setCanScrollRight(overflow && scrollLeft + clientWidth < scrollWidth - 4)
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
  }, [updateScrollState, children, hidden])

  function scrollBy(direction: 'left' | 'right') {
    viewportRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_STEP : SCROLL_STEP,
      behavior: 'smooth',
    })
  }

  return (
    <div className={`backlog-board-scroll${hidden ? ' backlog-board-scroll--hidden' : ''}${className ? ` ${className}` : ''}`}>
      {showHint && <p className="backlog-board-scroll__hint">{d.scrollHint}</p>}

      <div className="backlog-board-scroll__wrap">
        {canScrollLeft && (
          <div
            className="backlog-board-scroll__fade backlog-board-scroll__fade--left"
            aria-hidden="true"
          />
        )}
        {canScrollRight && (
          <div
            className="backlog-board-scroll__fade backlog-board-scroll__fade--right"
            aria-hidden="true"
          />
        )}

        {canScrollLeft && (
          <button
            type="button"
            className="backlog-board-scroll__arrow backlog-board-scroll__arrow--left"
            aria-label={d.scrollLeft}
            onClick={() => scrollBy('left')}
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            className="backlog-board-scroll__arrow backlog-board-scroll__arrow--right"
            aria-label={d.scrollRight}
            onClick={() => scrollBy('right')}
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
        )}

        <div ref={viewportRef} className="backlog-board-scroll__viewport">
          {children}
        </div>
      </div>
    </div>
  )
}
