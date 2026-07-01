import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, GripVertical } from 'lucide-react'
import { CompanyBadge, StatusBadge } from '../../../components/ui/StatusBadge'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import { canActOnOrder } from '../../../utils/dashboardPermissions'
import { isSupervisor } from '../../../utils/permissions'
import { formatTableList, resolveAssignedTableIds } from '../../../utils/backlogStorage'
import { getOrderStatusBadge } from '../../../utils/statusBadge'

interface BacklogOrderCardProps {
  order: BacklogOrder
  sortable?: boolean
  compact?: boolean
  completed?: boolean
  onViewDetail: (order: BacklogOrder) => void
  onPrepare?: (order: BacklogOrder) => void
  onConfirmRecipe?: (order: BacklogOrder) => void
  onMarkIncident?: (order: BacklogOrder) => void
  onCancel?: (order: BacklogOrder) => void
}

export function BacklogOrderCard(props: BacklogOrderCardProps) {
  const { sortable = true, completed = false, ...rest } = props
  if (completed || !sortable) {
    return <StaticBacklogOrderCard {...rest} completed={completed} />
  }
  return <SortableBacklogOrderCard {...rest} />
}

function BacklogOrderCardContent({
  order,
  compact = false,
  completed = false,
  dragHandle,
  onViewDetail,
  onPrepare,
  onConfirmRecipe,
}: {
  order: BacklogOrder
  compact?: boolean
  completed?: boolean
  dragHandle: ReactNode
  onViewDetail: (order: BacklogOrder) => void
  onPrepare?: (order: BacklogOrder) => void
  onConfirmRecipe?: (order: BacklogOrder) => void
}) {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.backlog

  const canAct = user ? canActOnOrder(user, order.company) : false
  const statusBadge = getOrderStatusBadge(order, lang)

  const tableIds = resolveAssignedTableIds(order)
  const tablesLabel =
    tableIds.length > 0
      ? formatTableList(tableIds)
      : `${order.requiredTables} ${d.tablesNeeded}`

  function renderPrimaryAction() {
    if (completed || !canAct) return null

    if (order.column === 'en_backlog' && onPrepare) {
      return (
        <button
          type="button"
          className="backlog-card__btn backlog-card__btn--primary"
          onClick={() => onPrepare(order)}
        >
          {d.actionPrepare}
        </button>
      )
    }

    if (order.column === 'en_preparacion' && onConfirmRecipe && user && isSupervisor(user)) {
      return (
        <button
          type="button"
          className="backlog-card__btn backlog-card__btn--primary"
          onClick={() => onConfirmRecipe(order)}
        >
          {d.confirmRecipe}
        </button>
      )
    }

    return null
  }

  return (
    <article
      className={`backlog-card order-card--${order.company.toLowerCase()}${!canAct ? ' backlog-card--readonly' : ''}${completed ? ' backlog-card--completed' : ''}${order.productionState === 'element_blocked' ? ' backlog-card--critical' : ''}`}
    >
      <div className="backlog-card__head">
        {!completed && dragHandle}
        <div className="backlog-card__head-main">
          <span className="backlog-card__ref">{order.reference}</span>
          <div className="backlog-card__badges">
            <CompanyBadge company={order.company} />
            <StatusBadge label={statusBadge.label} variant={statusBadge.variant} />
          </div>
        </div>
      </div>

      <div className="backlog-card__body">
        <p className="backlog-card__product">
          {order.product} · {order.variety}
        </p>
        {!completed && (
          <>
            <div className="backlog-card__stats">
              <span>
                {d.boxes}: <strong>{order.boxes}</strong>
              </span>
              {!compact && (
                <span>
                  {d.boxesPerHour}: <strong>{order.boxesPerHour}</strong>
                </span>
              )}
            </div>
            <div className="backlog-card__stats">
              <span>
                {d.tables}: <strong>{tablesLabel}</strong>
              </span>
            </div>
          </>
        )}
        {order.alerts.length > 0 && !completed && (
          <p className="backlog-card__alert">
            <AlertTriangle size={14} aria-hidden="true" />
            {order.alerts[0]}
          </p>
        )}
      </div>

      <div className="backlog-card__actions">
        {renderPrimaryAction()}
        <button type="button" className="backlog-card__btn" onClick={() => onViewDetail(order)}>
          {d.viewDetail}
        </button>
      </div>
    </article>
  )
}

function SortableBacklogOrderCard(props: Omit<BacklogOrderCardProps, 'sortable' | 'completed'>) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.backlog
  const { order } = props

  const canAct = user ? canActOnOrder(user, order.company) : false

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: order.id,
      disabled: !canAct,
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const dragHandle = canAct ? (
    <button
      type="button"
      className="backlog-card__drag"
      aria-label={d.dragLabel}
      {...attributes}
      {...listeners}
    >
      <GripVertical size={16} />
    </button>
  ) : (
    <span className="backlog-card__drag backlog-card__drag--disabled">
      <GripVertical size={16} />
    </span>
  )

  return (
    <div ref={setNodeRef} style={style}>
      <BacklogOrderCardContent {...props} dragHandle={dragHandle} />
    </div>
  )
}

function StaticBacklogOrderCard({
  order,
  compact,
  completed,
  onViewDetail,
  onPrepare,
  onConfirmRecipe,
}: Omit<BacklogOrderCardProps, 'sortable'>) {
  return (
    <BacklogOrderCardContent
      order={order}
      compact={compact}
      completed={completed}
      dragHandle={<span className="backlog-card__drag-spacer" aria-hidden="true" />}
      onViewDetail={onViewDetail}
      onPrepare={onPrepare}
      onConfirmRecipe={onConfirmRecipe}
    />
  )
}
