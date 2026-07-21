import { CompanyBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderFormData } from '../../../types/newOrder'
import { findProductById } from '../../../utils/productSearch'
import {
  getReferenceHeights,
  getReferencePalletType,
} from '../../../utils/referenceDisplayHelpers'
import { getSummaryStatus, type OrderSummaryStatus } from '../../../utils/newOrderViewHelpers'
import { BarcodeDisplay } from './BarcodeDisplay'

interface NewOrderLiveSummaryProps {
  form: NewOrderFormData
}

const STATUS_LABEL: Record<OrderSummaryStatus, 'summaryIncomplete' | 'summaryReady'> = {
  incomplete: 'summaryIncomplete',
  ready: 'summaryReady',
}

export function NewOrderLiveSummary({ form }: NewOrderLiveSummaryProps) {
  const { t } = useLanguage()
  const d = t.newOrder
  const status = getSummaryStatus(form)
  const selectedProduct = form.productId ? findProductById(form.productId) : null
  const palletType = selectedProduct ? getReferencePalletType(selectedProduct) : '—'
  const heights = selectedProduct ? getReferenceHeights(selectedProduct) : '—'

  return (
    <aside className={`new-order-summary order-card--${form.company.toLowerCase()} dash-card`}>
      <header className="new-order-summary__head">
        <h2 className="new-order-summary__title">{d.liveSummaryTitle}</h2>
        <span className={`new-order-summary__status new-order-summary__status--${status}`}>
          {d[STATUS_LABEL[status]]}
        </span>
      </header>

      <dl className="new-order-summary__list">
        <div>
          <dt>{d.company}</dt>
          <dd>
            <CompanyBadge company={form.company} />
          </dd>
        </div>
        <div>
          <dt>{d.productReference}</dt>
          <dd>{form.productReference.trim() || '—'}</dd>
        </div>
        <div>
          <dt>{d.product}</dt>
          <dd>{form.productName.trim() || form.product.trim() || '—'}</dd>
        </div>
        <div>
          <dt>{d.variety}</dt>
          <dd>{form.variety.trim() || '—'}</dd>
        </div>
        <div>
          <dt>{d.palletType}</dt>
          <dd>{palletType}</dd>
        </div>
        <div>
          <dt>{d.heights}</dt>
          <dd>{heights}</dd>
        </div>
        {form.barcode.trim() && (
          <div className="new-order-summary__barcode">
            <dt>{d.barcode}</dt>
            <dd>
              <BarcodeDisplay value={form.barcode} />
            </dd>
          </div>
        )}
        {form.boxFormat.trim() && (
          <div>
            <dt>{d.boxFormat}</dt>
            <dd>{form.boxFormat}</dd>
          </div>
        )}
        <div>
          <dt>{d.totalBoxesToProduce}</dt>
          <dd>
            {form.boxes.trim() && Number(form.boxes) > 0
              ? Number(form.boxes).toLocaleString()
              : '—'}
          </dd>
        </div>
      </dl>
    </aside>
  )
}
