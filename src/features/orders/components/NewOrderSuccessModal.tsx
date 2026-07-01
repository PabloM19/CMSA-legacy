import { CheckCircle2 } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'

interface NewOrderSuccessModalProps {
  reference: string
  onCreateAnother: () => void
  onGoToQueue: () => void
}

export function NewOrderSuccessModal({
  reference,
  onCreateAnother,
  onGoToQueue,
}: NewOrderSuccessModalProps) {
  const { t } = useLanguage()
  const d = t.newOrder

  return (
    <div className="order-modal-overlay" role="presentation">
      <div
        className="order-modal order-modal--neutral order-modal--success"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-success-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="order-modal__body order-modal__body--success">
          <CheckCircle2 size={40} className="order-success__icon" aria-hidden="true" />
          <h2 id="order-success-title" className="order-modal__title">
            {d.acceptedTitle}
          </h2>
          <p className="order-success__ref">{reference}</p>
          <p className="order-success__desc">{d.acceptedDesc}</p>
        </div>

        <div className="order-modal__actions order-modal__actions--stack">
          <button type="button" className="order-btn order-btn--primary order-btn--large" onClick={onCreateAnother}>
            {d.createAnother}
          </button>
          <button type="button" className="order-btn order-btn--ghost order-btn--large" onClick={onGoToQueue}>
            {d.goToQueue}
          </button>
        </div>
      </div>
    </div>
  )
}
