import { AlertTriangle } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderFormData } from '../../../types/newOrder'

interface ConfirmOrderFinalModalProps {
  form: NewOrderFormData
  onBackToModify: () => void
  onAcceptFinal: () => void
  submitting?: boolean
}

export function ConfirmOrderFinalModal({
  form,
  onBackToModify,
  onAcceptFinal,
  submitting = false,
}: ConfirmOrderFinalModalProps) {
  const { t } = useLanguage()
  const d = t.newOrder

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onBackToModify}>
      <div
        className="order-modal order-modal--wizard order-modal--neutral order-modal--final"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-order-final-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="order-modal__head">
          <h2 id="confirm-order-final-title" className="order-modal__title">
            {d.confirmFinalTitle}
          </h2>
        </header>

        <div className="order-modal__body">
          <p className="order-modal__final-ref">
            {form.productReference || form.productName}
            <span className="order-modal__final-company">{form.company}</span>
          </p>

          <div className="order-modal__final-notice" role="alert">
            <AlertTriangle size={20} aria-hidden="true" />
            <p>{d.criticalNotice}</p>
          </div>
        </div>

        <div className="order-modal__actions">
          <button
            type="button"
            className="order-btn order-btn--ghost order-btn--large"
            disabled={submitting}
            onClick={onBackToModify}
          >
            {d.backToModify}
          </button>
          <button
            type="button"
            className="order-btn order-btn--primary order-btn--large"
            disabled={submitting}
            onClick={onAcceptFinal}
          >
            {submitting ? d.creating : d.acceptFinal}
          </button>
        </div>
      </div>
    </div>
  )
}
