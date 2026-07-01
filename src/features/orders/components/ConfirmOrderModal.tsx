import { AlertTriangle } from 'lucide-react'
import { CompanyBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderFormData, OrderCalculation } from '../../../types/newOrder'
import { BarcodeDisplay } from './BarcodeDisplay'

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

  const productLine =
    form.productName.trim() || (form.product.trim() && form.variety.trim()
      ? `${form.product} · ${form.variety}`
      : '—')

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onModify}>
      <div
        className="order-modal order-modal--wizard order-modal--neutral order-modal--compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-order-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="order-modal__head order-modal__head--compact">
          <h2 id="confirm-order-title" className="order-modal__title">
            {d.confirmTitle}
          </h2>
        </header>

        <div className="order-modal__body order-modal__body--compact">
          <dl className="order-modal__grid-compact">
            <div className="order-modal__grid-item">
              <dt>{d.productReference}</dt>
              <dd>{form.productReference || '—'}</dd>
            </div>
            <div className="order-modal__grid-item">
              <dt>{d.company}</dt>
              <dd>
                <CompanyBadge company={form.company} />
              </dd>
            </div>
            <div className="order-modal__grid-item order-modal__grid-item--full">
              <dt>{d.barcode}</dt>
              <dd>
                {form.barcode ? (
                  <BarcodeDisplay value={form.barcode} />
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div className="order-modal__grid-item order-modal__grid-item--full">
              <dt>{d.product}</dt>
              <dd>{productLine}</dd>
            </div>
            <div className="order-modal__grid-item">
              <dt>{d.boxes}</dt>
              <dd>{boxes.toLocaleString()}</dd>
            </div>
            <div className="order-modal__grid-item">
              <dt>{d.boxesPerHour}</dt>
              <dd>{boxesPerHour.toLocaleString()}</dd>
            </div>
            <div className="order-modal__grid-item">
              <dt>{d.requiredTables}</dt>
              <dd>{calculation.requiredTables}</dd>
            </div>
            <div className="order-modal__grid-item">
              <dt>{d.eta}</dt>
              <dd>{calculation.eta}</dd>
            </div>
            <div className="order-modal__grid-item order-modal__grid-item--full">
              <dt>{d.estimatedEnd}</dt>
              <dd>{calculation.estimatedEnd}</dd>
            </div>
          </dl>

          {calculation.alerts.length > 0 && (
            <ul className="order-modal__alerts order-modal__alerts--compact">
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

          {calculation.blocked && (
            <p className="order-modal__blocked" role="alert">
              <strong>{d.acceptBlocked}</strong>
              <span>{calculation.blockReason ?? d.acceptBlockedHint}</span>
            </p>
          )}
        </div>

        <div className="order-modal__actions order-modal__actions--sticky">
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
