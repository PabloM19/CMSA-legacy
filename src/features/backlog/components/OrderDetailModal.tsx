import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'

interface OrderDetailModalProps {
  order: BacklogOrder
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const { t, dateLocale } = useLanguage()
  const d = t.backlog

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="order-modal backlog-detail"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="order-modal__title">{d.detailTitle}</h2>

        <dl className="order-modal__dl">
          <div className="order-modal__row">
            <dt>{d.company}</dt>
            <dd>
              <span className={`dash-chip dash-chip--${order.company.toLowerCase()}`}>
                {order.company}
              </span>
            </dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.status}</dt>
            <dd>{d.columns[order.column]}</dd>
          </div>
          <div className="order-modal__row">
            <dt>Referencia</dt>
            <dd className="order-modal__mono">{order.reference}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.boxes}</dt>
            <dd>{order.boxes}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.boxesPerHour}</dt>
            <dd>{order.boxesPerHour}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.assignedTables}</dt>
            <dd>
              {order.assignedTables.length > 0
                ? order.assignedTables.join(', ')
                : d.noAlerts}
            </dd>
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

        <div className="order-modal__actions">
          <button type="button" className="order-btn order-btn--ghost" onClick={onClose}>
            {d.close}
          </button>
        </div>
      </div>
    </div>
  )
}
