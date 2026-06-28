import { AlertTriangle } from 'lucide-react'
import { CompanyBadge, StatusBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import { getTableStats } from '../../../utils/validationHelpers'
import { getColumnStatusBadge } from '../../../utils/statusBadge'

interface ValidationOrderCardProps {
  order: BacklogOrder
  selected: boolean
  onSelect: (order: BacklogOrder) => void
}

export function ValidationOrderCard({ order, selected, onSelect }: ValidationOrderCardProps) {
  const { t, lang } = useLanguage()
  const d = t.validation
  const stats = getTableStats(order)
  const statusBadge = getColumnStatusBadge(order.column, lang)

  return (
    <button
      type="button"
      className={`validation-order order-card--${order.company.toLowerCase()}${selected ? ' validation-order--selected' : ''}`}
      onClick={() => onSelect(order)}
    >
      <div className="validation-order__head">
        <span className="validation-order__ref">{order.reference}</span>
        <CompanyBadge company={order.company} />
      </div>

      <p className="validation-order__product">
        {order.product} · {order.variety}
      </p>

      <div className="validation-order__progress-row">
        <span className="validation-order__progress">
          {stats.validated} / {stats.total} {d.tablesProgressShort}
        </span>
        <StatusBadge label={statusBadge.label} variant={statusBadge.variant} />
      </div>

      {order.alerts.length > 0 && (
        <p className="validation-order__alert">
          <AlertTriangle size={14} aria-hidden="true" />
          {order.alerts[0]}
        </p>
      )}
    </button>
  )
}
