import { HelpCircle } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DailyOrder } from '../../../types/dailyOrder'
import { pct } from '../../../utils/dailyOrderHelpers'

function fmt(n: number, lang: 'es' | 'en') {
  return n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')
}

function replaceTokens(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template,
  )
}

function getProgressSegments(order: DailyOrder) {
  const total = order.totalCajasDia
  const completed = Math.min(order.cajasCompletadas, total)
  const assigned = order.cajasAsignadas
  const inProgress = Math.max(0, Math.min(assigned, total) - completed)
  const unassigned = Math.max(0, total - assigned)

  return {
    total,
    completed,
    inProgress,
    unassigned,
    assigned,
    completedPct: pct(completed, total),
    inProgressPct: pct(inProgress, total),
    unassignedPct: pct(unassigned, total),
    assignedPct: pct(Math.min(assigned, total), total),
    overassigned: assigned > total,
  }
}

function FloatingTooltip({
  open,
  anchorRef,
  children,
  id,
  placement = 'bottom',
}: {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  children: ReactNode
  id: string
  placement?: 'bottom' | 'top'
}) {
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' })

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    const gap = 10
    const top =
      placement === 'bottom'
        ? rect.bottom + gap
        : rect.top - gap

    setStyle({
      position: 'fixed',
      top,
      left: rect.left + rect.width / 2,
      transform: placement === 'bottom' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
      zIndex: 12000,
      visibility: 'visible',
    })
  }, [anchorRef, placement])

  useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  if (!open) return null

  return createPortal(
    <div id={id} className="daily-orders-table__progress-popover" style={style} role="tooltip">
      {children}
    </div>,
    document.body,
  )
}

function TooltipDot({ tone }: { tone: 'completed' | 'in-progress' | 'unassigned' | 'total' }) {
  return <span className={`daily-orders-table__progress-dot daily-orders-table__progress-dot--${tone}`} aria-hidden="true" />
}

interface DailyOrderProgressCellProps {
  order: DailyOrder
  overassigned?: boolean
}

export function DailyOrderProgressCell({ order, overassigned = false }: DailyOrderProgressCellProps) {
  const { t, lang } = useLanguage()
  const d = t.backlog
  const segments = getProgressSegments(order)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  const assignedDisplayPct = pct(segments.assigned, segments.total)
  const shortLabel = replaceTokens(d.progressLabelShort, {
    completed: segments.completedPct,
    assigned: assignedDisplayPct,
  })

  return (
    <div className="daily-orders-table__progress">
      {overassigned && (
        <span className="daily-orders-table__over-badge">{d.overassignedBadge}</span>
      )}

      <div
        ref={triggerRef}
        className={`daily-orders-table__progress-trigger${segments.overassigned ? ' daily-orders-table__progress-trigger--overassigned' : ''}${open ? ' daily-orders-table__progress-trigger--open' : ''}`}
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <div className="daily-orders-table__progress-bar" role="img" aria-label={shortLabel}>
          <span
            className="daily-orders-table__progress-segment daily-orders-table__progress-segment--completed"
            style={{ width: `${segments.completedPct}%` }}
          />
          <span
            className="daily-orders-table__progress-segment daily-orders-table__progress-segment--in-progress"
            style={{
              left: `${segments.completedPct}%`,
              width: `${segments.inProgressPct}%`,
            }}
          />
        </div>

        <div className="daily-orders-table__progress-legend">
          <span className="daily-orders-table__progress-chip daily-orders-table__progress-chip--completed">
            <TooltipDot tone="completed" />
            {d.progressChipCompleted} {segments.completedPct}%
          </span>
          <span className="daily-orders-table__progress-chip daily-orders-table__progress-chip--assigned">
            <TooltipDot tone="in-progress" />
            {d.progressChipAssigned} {assignedDisplayPct}%
          </span>
        </div>
      </div>

      <FloatingTooltip open={open} anchorRef={triggerRef} id={tooltipId}>
        <p className="daily-orders-table__progress-popover-title">{order.variedad}</p>
        <ul className="daily-orders-table__progress-popover-list">
          <li>
            <TooltipDot tone="total" />
            <span>
              {replaceTokens(d.progressTooltipTotal, { total: fmt(segments.total, lang) })}
            </span>
          </li>
          <li>
            <TooltipDot tone="completed" />
            <span>
              {replaceTokens(d.progressTooltipCompleted, {
                boxes: fmt(segments.completed, lang),
                percent: segments.completedPct,
              })}
            </span>
          </li>
          <li>
            <TooltipDot tone="in-progress" />
            <span>
              {replaceTokens(d.progressTooltipInProgress, {
                boxes: fmt(segments.inProgress, lang),
                percent: segments.inProgressPct,
              })}
            </span>
          </li>
          <li>
            <TooltipDot tone="unassigned" />
            <span>
              {replaceTokens(d.progressTooltipUnassigned, {
                boxes: fmt(segments.unassigned, lang),
                percent: segments.unassignedPct,
              })}
            </span>
          </li>
        </ul>
        <p className="daily-orders-table__progress-popover-summary">
          {replaceTokens(d.progressTooltipAssignedSummary, {
            assigned: assignedDisplayPct,
            completed: segments.completedPct,
          })}
        </p>
      </FloatingTooltip>
    </div>
  )
}

export function DailyOrderProgressHeader() {
  const { t } = useLanguage()
  const d = t.backlog
  const helpRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  return (
    <span className="daily-orders-table__progress-head">
      {d.colProgress}
      <span
        ref={helpRef}
        className="daily-orders-table__progress-help"
        tabIndex={0}
        aria-label={d.progressHelpAria}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <HelpCircle size={13} aria-hidden="true" />
      </span>

      <FloatingTooltip open={open} anchorRef={helpRef} id={tooltipId} placement="bottom">
        <p className="daily-orders-table__progress-popover-title">{d.progressLegendTitle}</p>
        <p className="daily-orders-table__progress-popover-intro">{d.progressLegendIntro}</p>
        <ul className="daily-orders-table__progress-popover-list">
          <li>
            <TooltipDot tone="completed" />
            <span>{d.progressLegendCompleted}</span>
          </li>
          <li>
            <TooltipDot tone="in-progress" />
            <span>{d.progressLegendInProgress}</span>
          </li>
          <li>
            <TooltipDot tone="unassigned" />
            <span>{d.progressLegendUnassigned}</span>
          </li>
        </ul>
        <p className="daily-orders-table__progress-popover-intro">{d.progressLegendFormula}</p>
      </FloatingTooltip>
    </span>
  )
}
