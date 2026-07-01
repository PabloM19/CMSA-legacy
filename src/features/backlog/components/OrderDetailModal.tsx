import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import { CompanyBadge, StatusBadge } from '../../../components/ui/StatusBadge'
import type { BacklogOrder } from '../../../types/backlog'
import { formatTableList, resolveAssignedTableIds } from '../../../utils/backlogStorage'
import { getColumnStatusBadge } from '../../../utils/statusBadge'

interface OrderDetailModalProps {
  order: BacklogOrder
  onClose: () => void
  onMarkIncident?: () => void
  onCancel?: () => void
  onValidateTables?: () => void
}

export function OrderDetailModal({
  order,
  onClose,
  onMarkIncident,
  onCancel,
  onValidateTables,
}: OrderDetailModalProps) {
  const { user } = useAuth()
  const { t, lang, dateLocale } = useLanguage()
  const d = t.backlog

  const tableIds = resolveAssignedTableIds(order)
  const tablesDisplay =
    tableIds.length > 0
      ? formatTableList(tableIds)
      : order.requiredTables > 0
        ? `${order.requiredTables} ${d.tablesNeeded}`
        : d.noTables

  const statusBadge = getColumnStatusBadge(order.column, lang)
  const columnLabel = d.columns[order.column]

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="order-modal backlog-detail"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="backlog-detail__hero">
          <div className="backlog-detail__hero-main">
            <h2 className="order-modal__title">{order.reference}</h2>
            <div className="backlog-detail__hero-badges">
              <CompanyBadge company={order.company} />
              <StatusBadge label={columnLabel} variant={statusBadge.variant} />
            </div>
          </div>
          <p className="backlog-detail__hero-product">
            {order.product} · {order.variety}
          </p>
        </header>

        <dl className="order-modal__dl backlog-detail__grid">
          <div className="order-modal__row">
            <dt>{d.boxes}</dt>
            <dd>{order.boxes}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.boxesPerHour}</dt>
            <dd>{order.boxesPerHour}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.eta}</dt>
            <dd>{order.eta}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.endTime}</dt>
            <dd>{order.endTime}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.assignedTables}</dt>
            <dd>{tablesDisplay}</dd>
          </div>
        </dl>

        <section className="backlog-detail__section">
          <h3 className="order-modal__section-title">{d.alerts}</h3>
          {order.alerts.length === 0 ? (
            <p className="order-modal__no-alerts">{d.noAlerts}</p>
          ) : (
            <ul className="backlog-detail__alerts">
              {order.alerts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="backlog-detail__section">
          <h3 className="order-modal__section-title">{d.history}</h3>
          {order.auditTrail.length === 0 ? (
            <p className="order-modal__no-alerts">{d.noHistory}</p>
          ) : (
            <ul className="backlog-detail__history">
              {order.auditTrail.map((entry) => (
                <li key={entry.id}>
                  <span>{entry.action}</span>
                  <time dateTime={entry.timestamp}>
                    {new Date(entry.timestamp).toLocaleString(dateLocale, {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {entry.user ? ` · ${entry.user}` : ''}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="order-modal__actions backlog-detail__actions">
          {onValidateTables && (
            <button type="button" className="order-btn order-btn--ghost" onClick={onValidateTables}>
              {d.validateTables}
              <span className="backlog-card__demo-tag">{d.demo}</span>
            </button>
          )}
          {user?.role === 'superadmin' && onMarkIncident && (
            <button type="button" className="order-btn order-btn--ghost" onClick={onMarkIncident}>
              {d.markIncident}
            </button>
          )}
          {user?.role === 'superadmin' && onCancel && (
            <button type="button" className="order-btn order-btn--danger" onClick={onCancel}>
              {d.cancelOrder}
            </button>
          )}
          <button type="button" className="order-btn order-btn--primary" onClick={onClose}>
            {d.close}
          </button>
        </div>
      </div>
    </div>
  )
}
