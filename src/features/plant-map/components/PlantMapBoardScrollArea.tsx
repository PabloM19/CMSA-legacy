import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'

const SCROLL_STEP = 360
const DRAG_THRESHOLD_PX = 5

interface DragState {
  pointerId: number
  startX: number
  startScrollLeft: number
  moved: boolean
}

interface PlantMapBoardScrollAreaProps {
  children: ReactNode
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      'button, a, input, select, textarea, label, [role="button"], [data-no-board-drag]',
    ),
  )
}

export function PlantMapBoardScrollArea({ children }: PlantMapBoardScrollAreaProps) {
  const { t } = useLanguage()
  const d = t.plantMap
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflow = scrollWidth - clientWidth > 8
    setIsScrollable(overflow)
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
  }, [updateScrollState, children])

  useEffect(() => {
    function handleClickCapture(event: MouseEvent) {
      if (!suppressClickRef.current) return
      if (isInteractiveTarget(event.target)) {
        suppressClickRef.current = false
        return
      }
      event.preventDefault()
      event.stopPropagation()
      suppressClickRef.current = false
    }

    const el = viewportRef.current
    el?.addEventListener('click', handleClickCapture, true)
    return () => el?.removeEventListener('click', handleClickCapture, true)
  }, [])

  function scrollBy(direction: 'left' | 'right') {
    viewportRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_STEP : SCROLL_STEP,
      behavior: 'smooth',
    })
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    if (isInteractiveTarget(event.target)) return
    const el = viewportRef.current
    if (!el || !isScrollable) return

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    }
    el.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const el = viewportRef.current
    if (!drag || !el || event.pointerId !== drag.pointerId) return
    if (isInteractiveTarget(event.target)) return

    const deltaX = event.clientX - drag.startX
    if (!drag.moved && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return

    if (!drag.moved) {
      drag.moved = true
      setIsDragging(true)
    }

    event.preventDefault()
    el.scrollLeft = drag.startScrollLeft - deltaX
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const el = viewportRef.current
    if (!drag || !el || event.pointerId !== drag.pointerId) return

    if (drag.moved) {
      suppressClickRef.current = true
    }

    dragRef.current = null
    setIsDragging(false)
    if (el.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId)
    }
  }

  const viewportClassName = [
    'plant-map-board-scroll__viewport',
    isScrollable ? 'plant-map-board-scroll__viewport--scrollable' : '',
    isDragging ? 'plant-map-board-scroll__viewport--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="plant-map-board-scroll">
      <div className="plant-map-board-scroll__wrap">
        {canScrollLeft && (
          <div
            className="plant-map-board-scroll__fade plant-map-board-scroll__fade--left"
            aria-hidden="true"
          />
        )}
        {canScrollRight && (
          <div
            className="plant-map-board-scroll__fade plant-map-board-scroll__fade--right"
            aria-hidden="true"
          />
        )}

        {canScrollLeft && (
          <button
            type="button"
            className="plant-map-board-scroll__arrow plant-map-board-scroll__arrow--left"
            aria-label={d.scrollLeft}
            onClick={() => scrollBy('left')}
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            className="plant-map-board-scroll__arrow plant-map-board-scroll__arrow--right"
            aria-label={d.scrollRight}
            onClick={() => scrollBy('right')}
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
        )}

        <div
          ref={viewportRef}
          className={viewportClassName}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
