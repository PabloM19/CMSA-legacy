import { AlertTriangle } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderFormData, OrderCalculation } from '../../../types/newOrder'

interface ConfirmOrderModalProps {
  form: NewOrderFormData
  boxes: number
  boxesPerHour: number
  calculation: OrderCalculation
  onModify: () => void
  onAccept: () => void
}

export function ConfirmOrderModal({
  form,
  boxes,
  boxesPerHour,
  calculation,
  onModify,
  onAccept,
}: ConfirmOrderModalProps) {
  const { t } = useLanguage()
  const d = t.newOrder

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onModify}>
      <div
        className="order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-order-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-order-title" className="order-modal__title">
          {d.confirmTitle}
        </h2>

        <div className="order-modal__body">
          <section className="order-modal__section">
            <h3 className="order-modal__section-title">{d.summary}</h3>
            <dl className="order-modal__dl">
              <div className="order-modal__row">
                <dt>{d.company}</dt>
                <dd>
                  <span className={`dash-chip dash-chip--${form.company.toLowerCase()}`}>
                    {form.company}
                  </span>
                </dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.reference}</dt>
                <dd className="order-modal__mono">{form.reference}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.product}</dt>
                <dd>{form.product}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.variety}</dt>
                <dd>{form.variety}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.boxes}</dt>
                <dd>{boxes.toLocaleString()}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.boxesPerHour}</dt>
                <dd>{boxesPerHour.toLocaleString()}</dd>
              </div>
            </dl>
          </section>

          <section className="order-modal__section">
            <dl className="order-modal__dl">
              <div className="order-modal__row">
                <dt>{d.requiredTables}</dt>
                <dd>{calculation.requiredTables}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.eta}</dt>
                <dd>{calculation.eta}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.estimatedEnd}</dt>
                <dd>{calculation.estimatedEnd}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.capacityConsumed}</dt>
                <dd>{calculation.capacityConsumed}%</dd>
              </div>
            </dl>
          </section>

          <section className="order-modal__section">
            <h3 className="order-modal__section-title">{d.alerts}</h3>
            {calculation.alerts.length === 0 ? (
              <p className="order-modal__no-alerts">{d.noAlerts}</p>
            ) : (
              <ul className="order-modal__alerts">
                {calculation.alerts.map((alert) => (
                  <li
                    key={alert.message}
                    className={`order-modal__alert order-modal__alert--${alert.type}`}
                  >
                    <AlertTriangle size={14} aria-hidden="true" />
                    {alert.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="order-modal__notice">{d.criticalNotice}</p>

          {calculation.blocked && (
            <p className="order-modal__blocked" role="alert">
              <strong>{d.acceptBlocked}</strong>
              <span>{d.acceptBlockedHint}</span>
            </p>
          )}
        </div>

        <div className="order-modal__actions">
          <button type="button" className="order-btn order-btn--ghost" onClick={onModify}>
            {d.modify}
          </button>
          <button
            type="button"
            className="order-btn order-btn--primary"
            disabled={calculation.blocked}
            title={calculation.blockReason}
            onClick={onAccept}
          >
            {d.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
