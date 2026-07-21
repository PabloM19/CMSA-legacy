import {
  Boxes,
  Citrus,
  Layers3,
  Package,
  ScanBarcode,
  Tag,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderFormData } from '../../../types/newOrder'
import { findProductById } from '../../../utils/productSearch'
import {
  getReferenceHeights,
  getReferencePalletType,
} from '../../../utils/referenceDisplayHelpers'
import { BarcodeDisplay } from './BarcodeDisplay'

interface NewOrderConfirmSummaryProps {
  form: NewOrderFormData
}

export function NewOrderConfirmSummary({ form }: NewOrderConfirmSummaryProps) {
  const { t } = useLanguage()
  const d = t.newOrder

  const selectedProduct = form.productId ? findProductById(form.productId) : null
  const palletType = selectedProduct ? getReferencePalletType(selectedProduct) : '—'
  const heights = selectedProduct ? getReferenceHeights(selectedProduct) : '—'

  const productLine =
    form.productName.trim() ||
    (form.product.trim() && form.variety.trim() ? `${form.product} · ${form.variety}` : '—')

  const totalBoxes =
    form.boxes.trim() && Number(form.boxes) > 0 ? Number(form.boxes).toLocaleString() : '—'

  return (
    <section className="new-order-confirm-summary" aria-label={d.confirmSummaryTitle}>
      <h3 className="new-order-confirm-summary__title">{d.confirmSummaryTitle}</h3>

      <div className="new-order-confirm-summary__grid">
        <div className="new-order-confirm-summary__card">
          <span className="new-order-confirm-summary__card-icon" aria-hidden="true">
            <Tag size={18} />
          </span>
          <div>
            <span className="new-order-confirm-summary__card-label">{d.productReference}</span>
            <strong className="new-order-confirm-summary__card-value">
              {form.productReference || '—'}
            </strong>
          </div>
        </div>

        <div className="new-order-confirm-summary__card">
          <span className="new-order-confirm-summary__card-icon" aria-hidden="true">
            <Package size={18} />
          </span>
          <div>
            <span className="new-order-confirm-summary__card-label">{d.boxFormat}</span>
            <strong className="new-order-confirm-summary__card-value">{form.boxFormat || '—'}</strong>
          </div>
        </div>

        <div className="new-order-confirm-summary__card new-order-confirm-summary__card--wide">
          <span className="new-order-confirm-summary__card-icon" aria-hidden="true">
            <Citrus size={18} />
          </span>
          <div>
            <span className="new-order-confirm-summary__card-label">{d.product}</span>
            <strong className="new-order-confirm-summary__card-value">{productLine}</strong>
            {(form.variety.trim() || form.type.trim()) && (
              <span className="new-order-confirm-summary__card-meta">
                {[form.variety.trim(), form.type.trim()].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        </div>

        <div className="new-order-confirm-summary__card new-order-confirm-summary__card--wide">
          <span className="new-order-confirm-summary__card-icon" aria-hidden="true">
            <ScanBarcode size={18} />
          </span>
          <div>
            <span className="new-order-confirm-summary__card-label">{d.barcode}</span>
            <strong className="new-order-confirm-summary__card-value">
              {form.barcode ? <BarcodeDisplay value={form.barcode} /> : '—'}
            </strong>
          </div>
        </div>

        <div className="new-order-confirm-summary__card new-order-confirm-summary__card--wide new-order-confirm-summary__card--highlight">
          <span className="new-order-confirm-summary__card-icon" aria-hidden="true">
            <Boxes size={18} />
          </span>
          <div className="new-order-confirm-summary__total">
            <span className="new-order-confirm-summary__card-label">{d.totalBoxesToProduce}</span>
            <strong className="new-order-confirm-summary__card-value new-order-confirm-summary__card-value--hero">
              {totalBoxes}
            </strong>
          </div>
        </div>
      </div>

      <div className="new-order-confirm-summary__pallet">
        <div className="new-order-confirm-summary__pallet-groups">
          <div className="new-order-confirm-summary__pallet-group">
            <span className="new-order-confirm-summary__pallet-label">{d.palletType}</span>
            <span className="new-order-confirm-summary__chip">
              <Package size={14} aria-hidden="true" />
              {palletType}
            </span>
          </div>
          <div className="new-order-confirm-summary__pallet-group">
            <span className="new-order-confirm-summary__pallet-label">{d.heights}</span>
            <span className="new-order-confirm-summary__chip">
              <Layers3 size={14} aria-hidden="true" />
              {heights} {d.heightsUnit}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
