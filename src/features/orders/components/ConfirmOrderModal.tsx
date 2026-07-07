import { CompanyBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderFormData } from '../../../types/newOrder'
import { BarcodeDisplay } from './BarcodeDisplay'

interface ConfirmOrderModalProps {
  form: NewOrderFormData
  onModify: () => void
  onAccept: () => void
}

export function ConfirmOrderModal({ form, onModify, onAccept }: ConfirmOrderModalProps) {
  const { t } = useLanguage()
  const d = t.newOrder

  const productLine =
    form.productName.trim() ||
    (form.product.trim() && form.variety.trim() ? `${form.product} · ${form.variety}` : '—')

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
              <dd>{form.barcode ? <BarcodeDisplay value={form.barcode} /> : '—'}</dd>
            </div>
            <div className="order-modal__grid-item order-modal__grid-item--full">
              <dt>{d.product}</dt>
              <dd>{productLine}</dd>
            </div>
            <div className="order-modal__grid-item">
              <dt>{d.variety}</dt>
              <dd>{form.variety || '—'}</dd>
            </div>
            <div className="order-modal__grid-item">
              <dt>{d.type}</dt>
              <dd>{form.type || '—'}</dd>
            </div>
            <div className="order-modal__grid-item order-modal__grid-item--full">
              <dt>{d.boxFormat}</dt>
              <dd>{form.boxFormat || '—'}</dd>
            </div>
            <div className="order-modal__grid-item order-modal__grid-item--full">
              <dt>{d.totalBoxesToProduce}</dt>
              <dd>
                {form.boxes.trim() && Number(form.boxes) > 0
                  ? Number(form.boxes).toLocaleString()
                  : '—'}
              </dd>
            </div>
          </dl>
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
