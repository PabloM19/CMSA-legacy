import { CompanyBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderFormData, OrderCalculation } from '../../../types/newOrder'
import { getSummaryStatus, type OrderSummaryStatus } from '../../../utils/newOrderViewHelpers'
import { BarcodeDisplay } from './BarcodeDisplay'

interface NewOrderLiveSummaryProps {
  form: NewOrderFormData
  calculation: OrderCalculation | null
}

const STATUS_LABEL: Record<OrderSummaryStatus, 'summaryIncomplete' | 'summaryReady' | 'summaryCalculated' | 'summaryBlocked'> = {
  incomplete: 'summaryIncomplete',
  readyToCalculate: 'summaryReady',
  calculated: 'summaryCalculated',
  blocked: 'summaryBlocked',
}

export function NewOrderLiveSummary({ form, calculation }: NewOrderLiveSummaryProps) {
  const { t } = useLanguage()
  const d = t.newOrder
  const status = getSummaryStatus(form, calculation)

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
        {form.barcode.trim() && (
          <div className="new-order-summary__barcode">
            <dt>{d.barcode}</dt>
            <dd>
              <BarcodeDisplay value={form.barcode} />
            </dd>
          </div>
        )}
        <div>
          <dt>{d.product}</dt>
          <dd>{form.productName.trim() || form.product.trim() || '—'}</dd>
        </div>
        {form.variety.trim() && (
          <div>
            <dt>{d.variety}</dt>
            <dd>{form.variety}</dd>
          </div>
        )}
        <div>
          <dt>{d.boxes}</dt>
          <dd>{form.boxes.trim() ? Number(form.boxes).toLocaleString() : '—'}</dd>
        </div>
        <div>
          <dt>{d.boxesPerHour}</dt>
          <dd>{form.boxesPerHour.trim() ? Number(form.boxesPerHour).toLocaleString() : '—'}</dd>
        </div>
        {calculation && (
          <>
            <div>
              <dt>{d.requiredTables}</dt>
              <dd>{calculation.requiredTables}</dd>
            </div>
            <div>
              <dt>{d.estimatedEnd}</dt>
              <dd>{calculation.estimatedEnd}</dd>
            </div>
          </>
        )}
      </dl>
    </aside>
  )
}
