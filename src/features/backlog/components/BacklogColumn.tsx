import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Inbox,
  Send,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogColumnId, BacklogOrder } from '../../../types/backlog'
import { BacklogOrderCard } from './BacklogOrderCard'

const COLUMN_ICONS: Record<BacklogColumnId, LucideIcon> = {
  en_backlog: Inbox,
  pendiente_lanzamiento: Send,
  pendiente_validacion: ClipboardCheck,
  en_ejecucion: Factory,
  bloqueado: AlertTriangle,
  finalizado: CheckCircle2,
}

interface BacklogColumnProps {
  columnId: BacklogColumnId
  orders: BacklogOrder[]
  allOrdersInColumn: BacklogOrder[]
  visibleLimit: number | null
  scrollable: boolean
  compactCards: boolean
  emptyMessage?: string
  summaryMode?: boolean
  onViewAll?: () => void
  onViewDetail: (order: BacklogOrder) => void
  onSendValidation: (order: BacklogOrder) => void
  onPrepare: (order: BacklogOrder) => void
  onMarkIncident: (order: BacklogOrder) => void
  onCancel: (order: BacklogOrder) => void
  onValidateTables: (order: BacklogOrder) => void
}

export function BacklogColumn({
  columnId,
  orders,
  allOrdersInColumn,
  visibleLimit,
  scrollable,
  compactCards,
  emptyMessage,
  summaryMode = false,
  onViewAll,
  onViewDetail,
  onSendValidation,
  onPrepare,
  onMarkIncident,
  onCancel,
  onValidateTables,
}: BacklogColumnProps) {
  const { t } = useLanguage()
  const d = t.backlog
  const { setNodeRef, isOver } = useDroppable({ id: columnId })
  const Icon = COLUMN_ICONS[columnId]

  const displayOrders =
    visibleLimit != null ? orders.slice(0, visibleLimit) : orders
  const hiddenCount = allOrdersInColumn.length - displayOrders.length
  const showMoreFooter = visibleLimit != null && hiddenCount > 0 && onViewAll
  const count = allOrdersInColumn.length

  return (
    <section
      ref={setNodeRef}
      className={`backlog-column dash-card${isOver ? ' backlog-column--over' : ''}${scrollable ? ' backlog-column--scroll' : ''}`}
    >
      <header className="backlog-column__head">
        <div className="backlog-column__head-main">
          <span className="backlog-column__icon" aria-hidden="true">
            <Icon size={20} strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="backlog-column__title">{d.columns[columnId]}</h2>
            <p className="backlog-column__hint">{d.columnHints[columnId]}</p>
          </div>
        </div>
        <span className="backlog-column__count">{count}</span>
      </header>
      <SortableContext
        items={displayOrders.map((o) => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="backlog-column__list">
          {count === 0 && (
            <p className="backlog-column__empty">{emptyMessage ?? d.columnEmpty}</p>
          )}
          {displayOrders.map((order) => (
            <BacklogOrderCard
              key={order.id}
              order={order}
              compact={compactCards}
              onViewDetail={onViewDetail}
              onSendValidation={onSendValidation}
              onPrepare={onPrepare}
              onMarkIncident={onMarkIncident}
              onCancel={onCancel}
              onValidateTables={onValidateTables}
            />
          ))}
          {showMoreFooter && (
            <div
              className={`backlog-column__more${summaryMode ? ' backlog-column__more--summary' : ''}`}
            >
              <p className="backlog-column__more-label">
                {d.moreOrders.replace('{count}', String(hiddenCount))}
              </p>
              <button type="button" className="backlog-column__view-all" onClick={onViewAll}>
                {d.viewAll}
              </button>
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  )
}

export const BACKLOG_COLUMNS: BacklogColumnId[] = [
  'en_backlog',
  'pendiente_lanzamiento',
  'pendiente_validacion',
  'en_ejecucion',
  'bloqueado',
  'finalizado',
]
