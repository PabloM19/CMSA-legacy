import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, ClipboardList, Factory, Inbox } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogColumnId, BacklogOrder } from '../../../types/backlog'
import { MAIN_BOARD_COLUMNS } from '../../../utils/backlogRules'
import { BacklogOrderCard } from './BacklogOrderCard'

const COLUMN_ICONS: Record<BacklogColumnId, LucideIcon> = {
  en_backlog: Inbox,
  en_preparacion: ClipboardList,
  en_produccion: Factory,
  finalizado: CheckCircle2,
}

interface BacklogColumnProps {
  columnId: BacklogColumnId
  orders: BacklogOrder[]
  completedOrders?: BacklogOrder[]
  allOrdersInColumn: BacklogOrder[]
  visibleLimit: number | null
  scrollable: boolean
  compactCards: boolean
  emptyMessage?: string
  summaryMode?: boolean
  onViewAll?: () => void
  onViewAllCompleted?: () => void
  onViewDetail: (order: BacklogOrder) => void
  onPrepare: (order: BacklogOrder) => void
  onConfirmRecipe?: (order: BacklogOrder) => void
  onWithdraw?: (order: BacklogOrder) => void
}

export function BacklogColumn({
  columnId,
  orders,
  completedOrders = [],
  allOrdersInColumn,
  visibleLimit,
  scrollable,
  compactCards,
  emptyMessage,
  summaryMode = false,
  onViewAll,
  onViewAllCompleted,
  onViewDetail,
  onPrepare,
  onConfirmRecipe,
  onWithdraw,
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
  const isEmpty = count === 0 && completedOrders.length === 0

  const completedVisible =
    visibleLimit != null ? completedOrders.slice(0, visibleLimit) : completedOrders
  const completedHidden =
    visibleLimit != null ? completedOrders.length - completedVisible.length : 0

  return (
    <section
      ref={setNodeRef}
      className={`backlog-column dash-card${isOver ? ' backlog-column--over' : ''}${scrollable ? ' backlog-column--scroll' : ''}${isEmpty ? ' backlog-column--empty' : ''}`}
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
          {count === 0 && completedOrders.length === 0 && (
            <p className="backlog-column__empty">{emptyMessage ?? d.columnEmpty}</p>
          )}
          {displayOrders.map((order) => (
            <BacklogOrderCard
              key={order.id}
              order={order}
              compact={compactCards}
              sortable={columnId !== 'finalizado'}
              completed={columnId === 'finalizado'}
              onViewDetail={onViewDetail}
              onPrepare={onPrepare}
              onConfirmRecipe={onConfirmRecipe}
              onWithdraw={onWithdraw}
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

          {columnId === 'en_produccion' && completedOrders.length > 0 && (
            <div className="backlog-column__completed">
              <h3 className="backlog-column__completed-title">{d.completedSectionTitle}</h3>
              {completedVisible.map((order) => (
                <BacklogOrderCard
                  key={order.id}
                  order={order}
                  compact={compactCards}
                  sortable={false}
                  completed
                  onViewDetail={onViewDetail}
                />
              ))}
              {completedHidden > 0 && onViewAllCompleted && (
                <button
                  type="button"
                  className="backlog-column__view-all backlog-column__view-all--completed"
                  onClick={onViewAllCompleted}
                >
                  {d.viewAllCompleted}
                </button>
              )}
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  )
}

export const BACKLOG_COLUMNS = MAIN_BOARD_COLUMNS
