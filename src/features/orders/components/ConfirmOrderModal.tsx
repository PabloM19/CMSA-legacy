import { AlertTriangle, LayoutGrid, Gauge, Clock } from 'lucide-react'
import { CompanyBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderFormData, OrderCalculation } from '../../../types/newOrder'
import { getAssignmentDisplayType } from '../../../utils/newOrderViewHelpers'

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

  const assignmentType = getAssignmentDisplayType(calculation)
  const assignmentLabel =
    assignmentType === 'automatic'
      ? d.assignmentAutomatic
      : assignmentType === 'manual'
        ? d.assignmentManual
        : d.assignmentMixed

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onModify}>
      <div
        className={`order-modal order-modal--wizard order-card--${form.company.toLowerCase()}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-order-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="order-modal__head">
          <h2 id="confirm-order-title" className="order-modal__title">
            {d.confirmTitle}
          </h2>
          <p className="order-modal__subtitle">{d.step4Desc}</p>
        </header>

        <div className="order-modal__body">
          <section className="order-modal__hero dash-card">
            <div className="order-modal__hero-main">
              <span className="order-modal__ref">{form.productReference || form.productName}</span>
              <CompanyBadge company={form.company} />
            </div>
            <p className="order-modal__product">
              {form.productName || `${form.product} · ${form.variety}`}
            </p>
            {form.productReference && form.productName && (
              <p className="order-modal__product-sub">
                {form.product} · {form.variety}
              </p>
            )}
          </section>

          <div className="order-modal__impact-grid">
            <article className="order-modal__impact-card">
              <LayoutGrid size={18} aria-hidden="true" />
              <span>{d.requiredTables}</span>
              <strong>{calculation.requiredTables}</strong>
            </article>
            <article className="order-modal__impact-card">
              <Clock size={18} aria-hidden="true" />
              <span>{d.estimatedEnd}</span>
              <strong>{calculation.estimatedEnd}</strong>
            </article>
            <article className="order-modal__impact-card">
              <Gauge size={18} aria-hidden="true" />
              <span>{d.capacityConsumed}</span>
              <strong>{calculation.capacityConsumed}%</strong>
            </article>
          </div>

          <dl className="order-modal__dl">
            <div className="order-modal__row">
              <dt>{d.boxes}</dt>
              <dd>{boxes.toLocaleString()}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.boxesPerHour}</dt>
              <dd>{boxesPerHour.toLocaleString()}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.assignmentType}</dt>
              <dd>{assignmentLabel}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.eta}</dt>
              <dd>{calculation.eta}</dd>
            </div>
          </dl>

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
          <button type="button" className="order-btn order-btn--ghost order-btn--large" onClick={onModify}>
            {d.modify}
          </button>
          <button
            type="button"
            className="order-btn order-btn--primary order-btn--large"
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
