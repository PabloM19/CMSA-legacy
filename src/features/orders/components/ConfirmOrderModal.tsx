import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderFormData } from '../../../types/newOrder'
import { NewOrderConfirmSummary } from './NewOrderConfirmSummary'

interface ConfirmOrderModalProps {
  form: NewOrderFormData
  onModify: () => void
  onAccept: () => void
}

export function ConfirmOrderModal({ form, onModify, onAccept }: ConfirmOrderModalProps) {
  const { t } = useLanguage()
  const d = t.newOrder

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
          <p className="order-modal__subtitle">{d.confirmSummaryDesc}</p>
        </header>

        <div className="order-modal__body order-modal__body--compact">
          <NewOrderConfirmSummary form={form} />
        </div>

        <div className="order-modal__actions order-modal__actions--sticky">
          <button type="button" className="order-btn order-btn--ghost order-btn--large" onClick={onModify}>
            {d.modify}
          </button>
          <button type="button" className="order-btn order-btn--primary order-btn--large" onClick={onAccept}>
            {d.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
