import { CompanyBadge, StatusBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import { formatTableList, resolveAssignedTableIds } from '../../../utils/backlogStorage'
import {
  canStartProduction,
  getTableStats,
  hasTableConflicts,
} from '../../../utils/validationHelpers'
import { getColumnStatusBadge } from '../../../utils/statusBadge'

interface ValidationOrderSummaryProps {
  order: BacklogOrder
}

export function ValidationOrderSummary({ order }: ValidationOrderSummaryProps) {
  const { t, lang } = useLanguage()
  const d = t.validation
  const b = t.backlog
  const stats = getTableStats(order)
  const statusBadge = getColumnStatusBadge(order.column, lang)
  const tableIds = resolveAssignedTableIds(order)
  const tablesLabel =
    tableIds.length > 0
      ? formatTableList(tableIds)
      : `${order.requiredTables} ${b.tablesNeeded}`

  const ready = canStartProduction(order)
  const conflict = hasTableConflicts(order)

  let noticeKey: 'noticeBlocked' | 'noticeReady' | 'noticeConflict' = 'noticeBlocked'
  if (conflict) noticeKey = 'noticeConflict'
  else if (ready) noticeKey = 'noticeReady'

  return (
    <section
      className={`validation-order-summary order-card--${order.company.toLowerCase()} dash-card`}
    >
      <header className="validation-order-summary__head">
        <div>
          <h2 className="validation-order-summary__ref">{order.reference}</h2>
          <p className="validation-order-summary__product">
            {order.product} · {order.variety}
          </p>
        </div>
        <div className="validation-order-summary__badges">
          <CompanyBadge company={order.company} />
          <StatusBadge label={statusBadge.label} variant={statusBadge.variant} />
        </div>
      </header>

      <div className="validation-order-summary__grid">
        <div>
          <span className="validation-order-summary__label">{d.boxes}</span>
          <strong>{order.boxes}</strong>
        </div>
        <div>
          <span className="validation-order-summary__label">{d.boxesPerHour}</span>
          <strong>{order.boxesPerHour}</strong>
        </div>
        <div>
          <span className="validation-order-summary__label">{d.eta}</span>
          <strong>{order.eta}</strong>
        </div>
        <div>
          <span className="validation-order-summary__label">{d.endTime}</span>
          <strong>{order.endTime}</strong>
        </div>
        <div className="validation-order-summary__wide">
          <span className="validation-order-summary__label">{d.assignedTables}</span>
          <strong>{tablesLabel}</strong>
        </div>
        <div>
          <span className="validation-order-summary__label">{d.validationProgress}</span>
          <strong>
            {stats.validated} / {stats.total}
          </strong>
        </div>
      </div>

      <p
        className={`validation-order-summary__notice validation-order-summary__notice--${conflict ? 'conflict' : ready ? 'ready' : 'pending'}`}
      >
        {d[noticeKey]}
      </p>
    </section>
  )
}
