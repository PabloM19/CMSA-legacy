import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, GripVertical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CompanyBadge, StatusBadge } from '../../../components/ui/StatusBadge'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import { canActOnOrder } from '../../../utils/dashboardPermissions'
import { formatTableList, resolveAssignedTableIds } from '../../../utils/backlogStorage'
import { getColumnStatusBadge } from '../../../utils/statusBadge'

interface BacklogOrderCardProps {
  order: BacklogOrder
  sortable?: boolean
  compact?: boolean
  onViewDetail: (order: BacklogOrder) => void
  onSendValidation?: (order: BacklogOrder) => void
  onPrepare?: (order: BacklogOrder) => void
  onMarkIncident?: (order: BacklogOrder) => void
  onCancel?: (order: BacklogOrder) => void
  onValidateTables?: (order: BacklogOrder) => void
}

export function BacklogOrderCard(props: BacklogOrderCardProps) {
  const { sortable = true, ...rest } = props
  if (sortable) {
    return <SortableBacklogOrderCard {...rest} />
  }
  return <StaticBacklogOrderCard {...rest} />
}

function BacklogOrderCardContent({
  order,
  compact = false,
  dragHandle,
  onViewDetail,
  onSendValidation,
  onPrepare,
}: {
  order: BacklogOrder
  compact?: boolean
  dragHandle: ReactNode
  onViewDetail: (order: BacklogOrder) => void
  onSendValidation?: (order: BacklogOrder) => void
  onPrepare?: (order: BacklogOrder) => void
}) {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.backlog

  const canAct = user ? canActOnOrder(user, order.company) : false
  const isMaster = user?.role === 'master'
  const statusBadge = getColumnStatusBadge(order.column, lang)
  const columnLabel = d.columns[order.column]

  const tableIds = resolveAssignedTableIds(order)
  const tablesLabel =
    tableIds.length > 0
      ? formatTableList(tableIds)
      : `${order.requiredTables} ${d.tablesNeeded}`

  function renderPrimaryAction() {
    if (!canAct) return null

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

    if (order.column === 'pendiente_lanzamiento' && onSendValidation) {
      return (
        <button
          type="button"
          className="backlog-card__btn backlog-card__btn--primary"
          onClick={() => onSendValidation(order)}
        >
          {d.sendValidation}
        </button>
      )
    }

    if (order.column === 'bloqueado' && isMaster) {
      return (
        <button
          type="button"
          className="backlog-card__btn backlog-card__btn--primary"
          onClick={() => onViewDetail(order)}
        >
          {d.actionReview}
        </button>
      )
    }

    return null
  }

  function renderSecondaryAction() {
    if (order.column === 'pendiente_validacion') {
      return (
        <Link to="/validation" className="backlog-card__btn backlog-card__btn--link">
          {d.goValidation}
        </Link>
      )
    }

    return (
      <button type="button" className="backlog-card__btn" onClick={() => onViewDetail(order)}>
        {d.viewDetail}
      </button>
    )
  }

  return (
    <article
      className={`backlog-card order-card--${order.company.toLowerCase()}${!canAct ? ' backlog-card--readonly' : ''}`}
    >
      <div className="backlog-card__head">
        {dragHandle}
        <div className="backlog-card__head-main">
          <span className="backlog-card__ref">{order.reference}</span>
          <div className="backlog-card__badges">
            <CompanyBadge company={order.company} />
            <StatusBadge label={columnLabel} variant={statusBadge.variant} />
          </div>
        </div>
      </div>

      <div className="backlog-card__body">
        <p className="backlog-card__product">
          {order.product} · {order.variety}
        </p>
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
        {!compact && (
          <div className="backlog-card__stats">
            <span>
              {d.eta}: <strong>{order.eta}</strong>
            </span>
            <span>
              {d.endTime}: <strong>{order.endTime}</strong>
            </span>
          </div>
        )}
        {order.alerts.length > 0 && (
          <p className="backlog-card__alert">
            <AlertTriangle size={14} aria-hidden="true" />
            {order.alerts[0]}
          </p>
        )}
      </div>

      {!canAct && (
        <p className="backlog-card__readonly">
          <span>{d.readOnlyShort}</span>
          <span className="backlog-card__readonly-sep">·</span>
          <span>{d.readOnlyOtherCompany}</span>
        </p>
      )}

      <div className="backlog-card__actions">
        {renderPrimaryAction()}
        {renderSecondaryAction()}
      </div>
    </article>
  )
}

function SortableBacklogOrderCard({
  order,
  compact,
  onViewDetail,
  onSendValidation,
  onPrepare,
}: Omit<BacklogOrderCardProps, 'sortable'>) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.backlog

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
      <BacklogOrderCardContent
        order={order}
        compact={compact}
        dragHandle={dragHandle}
        onViewDetail={onViewDetail}
        onSendValidation={onSendValidation}
        onPrepare={onPrepare}
      />
    </div>
  )
}

function StaticBacklogOrderCard({
  order,
  compact,
  onViewDetail,
  onSendValidation,
  onPrepare,
}: Omit<BacklogOrderCardProps, 'sortable'>) {
  return (
    <BacklogOrderCardContent
      order={order}
      compact={compact}
      dragHandle={<span className="backlog-card__drag-spacer" aria-hidden="true" />}
      onViewDetail={onViewDetail}
      onSendValidation={onSendValidation}
      onPrepare={onPrepare}
    />
  )
}
