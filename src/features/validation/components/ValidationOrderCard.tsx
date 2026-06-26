import { AlertTriangle } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import { getTableStats } from '../../../utils/validationHelpers'

interface ValidationOrderCardProps {
  order: BacklogOrder
  selected: boolean
  onSelect: (order: BacklogOrder) => void
}

export function ValidationOrderCard({ order, selected, onSelect }: ValidationOrderCardProps) {
  const { t } = useLanguage()
  const d = t.validation
  const b = t.backlog
  const stats = getTableStats(order)

  return (
    <button
      type="button"
      className={`validation-order order-card--${order.company.toLowerCase()}${selected ? ' validation-order--selected' : ''}`}
      onClick={() => onSelect(order)}
    >
      <div className="validation-order__head">
        <span className="validation-order__ref">{order.reference}</span>
        <span className={`dash-chip dash-chip--${order.company.toLowerCase()}`}>
          {order.company}
        </span>
      </div>

      <p className="validation-order__product">
        {order.product} · {order.variety}
      </p>

      <div className="validation-order__meta">
        <span>
          {d.boxes}: <strong>{order.boxes}</strong>
        </span>
        <span>
          {d.boxesPerHour}: <strong>{order.boxesPerHour}</strong>
        </span>
      </div>
      <div className="validation-order__meta">
        <span>
          {d.eta}: <strong>{order.eta}</strong>
        </span>
        <span>
          {d.endTime}: <strong>{order.endTime}</strong>
        </span>
      </div>

      <div className="validation-order__footer">
        <span className="validation-order__status">{b.columns[order.column]}</span>
        <span className="validation-order__progress">
          {stats.validated} / {stats.total} {d.tablesProgress.toLowerCase()}
        </span>
      </div>

      {order.alerts.length > 0 && (
        <p className="validation-order__alert">
          <AlertTriangle size={12} aria-hidden="true" />
          {order.alerts[0]}
        </p>
      )}
    </button>
  )
}
