import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, GripVertical } from 'lucide-react'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import { canActOnOrder } from '../../../utils/dashboardPermissions'

interface BacklogOrderCardProps {
  order: BacklogOrder
  onViewDetail: (order: BacklogOrder) => void
  onSendValidation?: (order: BacklogOrder) => void
  onMarkIncident?: (order: BacklogOrder) => void
  onCancel?: (order: BacklogOrder) => void
  onValidateTables?: (order: BacklogOrder) => void
}

export function BacklogOrderCard({
  order,
  onViewDetail,
  onSendValidation,
  onMarkIncident,
  onCancel,
  onValidateTables,
}: BacklogOrderCardProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.backlog

  const canAct = user ? canActOnOrder(user, order.company) : false
  const isMaster = user?.role === 'master'

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

  const tablesLabel =
    order.assignedTables.length > 0
      ? order.assignedTables.join(', ')
      : `${order.requiredTables} ${d.tablesNeeded}`

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`backlog-card order-card--${order.company.toLowerCase()}${!canAct ? ' backlog-card--readonly' : ''}`}
    >
      <div className="backlog-card__head">
        {canAct ? (
          <button
            type="button"
            className="backlog-card__drag"
            aria-label="Drag"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
        ) : (
          <span className="backlog-card__drag backlog-card__drag--disabled">
            <GripVertical size={14} />
          </span>
        )}
        <span className="backlog-card__ref">{order.reference}</span>
        <span className={`dash-chip dash-chip--${order.company.toLowerCase()}`}>
          {order.company}
        </span>
      </div>

      <div className="backlog-card__body">
        <p className="backlog-card__product">
          {order.product} · {order.variety}
        </p>
        <div className="backlog-card__meta">
          <span>
            {d.boxes}: <strong>{order.boxes}</strong>
          </span>
          <span>
            {d.boxesPerHour}: <strong>{order.boxesPerHour}</strong>
          </span>
        </div>
        <div className="backlog-card__meta">
          <span>
            {d.eta}: <strong>{order.eta}</strong>
          </span>
          <span>
            {d.endTime}: <strong>{order.endTime}</strong>
          </span>
        </div>
        <div className="backlog-card__meta">
          <span>
            {d.tables}: <strong>{tablesLabel}</strong>
          </span>
        </div>
        {order.tablesValidated && (
          <span className="backlog-card__badge backlog-card__badge--ok">
            {d.tablesValidated}
          </span>
        )}
        {order.alerts.length > 0 && (
          <p className="backlog-card__alert">
            <AlertTriangle size={12} aria-hidden="true" />
            {order.alerts[0]}
          </p>
        )}
      </div>

      {!canAct && (
        <p className="backlog-card__readonly" title={d.readOnly}>
          {d.readOnly}
        </p>
      )}

      <div className="backlog-card__actions">
        <button type="button" className="backlog-card__btn" onClick={() => onViewDetail(order)}>
          {d.viewDetail}
        </button>
        {canAct && order.column === 'pendiente_lanzamiento' && onSendValidation && (
          <button
            type="button"
            className="backlog-card__btn backlog-card__btn--primary"
            onClick={() => onSendValidation(order)}
          >
            {d.sendValidation}
          </button>
        )}
        {canAct &&
          order.column === 'pendiente_validacion' &&
          !order.tablesValidated &&
          onValidateTables && (
            <button
              type="button"
              className="backlog-card__btn"
              onClick={() => onValidateTables(order)}
            >
              {d.validateTables}
            </button>
          )}
        {isMaster && onMarkIncident && order.column !== 'bloqueado' && (
          <button
            type="button"
            className="backlog-card__btn backlog-card__btn--warn"
            onClick={() => onMarkIncident(order)}
          >
            {d.markIncident}
          </button>
        )}
        {isMaster && onCancel && order.column !== 'finalizado' && (
          <button
            type="button"
            className="backlog-card__btn backlog-card__btn--warn"
            onClick={() => onCancel(order)}
          >
            {d.cancelOrder}
          </button>
        )}
      </div>
    </article>
  )
}
