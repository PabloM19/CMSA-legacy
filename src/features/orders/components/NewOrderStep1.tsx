import { CompanyBadge } from '../../../components/ui/StatusBadge'
import { FormField, Input, Select } from '../../../components/ui/FormField'
import { findProductById } from '../../../utils/productSearch'
import { useLanguage } from '../../../i18n/LanguageContext'
import {
  getReferenceHeights,
  getReferencePalletType,
} from '../../../utils/referenceDisplayHelpers'
import type { MockProduct } from '../../../data/mockProducts'
import type { NewOrderFormData, NewOrderFormErrors, OrderCompany } from '../../../types/newOrder'
import { ProductSearchAutocomplete } from './ProductSearchAutocomplete'

interface NewOrderStep1Props {
  form: NewOrderFormData
  errors: NewOrderFormErrors
  companyLocked: boolean
  onChange: <K extends keyof NewOrderFormData>(key: K, value: NewOrderFormData[K]) => void
  onSelectProduct: (product: MockProduct) => void
  onClearProduct: () => void
}

export function NewOrderStep1({
  form,
  errors,
  companyLocked,
  onChange,
  onSelectProduct,
  onClearProduct,
}: NewOrderStep1Props) {
  const { t } = useLanguage()
  const d = t.newOrder

  const selectedProduct = form.productId ? findProductById(form.productId) ?? null : null
  const fromCatalog = Boolean(selectedProduct)
  const catalogHint = fromCatalog ? d.catalogReadonlyHint : undefined
  const palletType = selectedProduct ? getReferencePalletType(selectedProduct) : ''
  const heights = selectedProduct ? getReferenceHeights(selectedProduct) : ''

  return (
    <section className="new-order-step dash-card">
      <header className="new-order-step__head">
        <h2 className="new-order-step__title">{d.step1Title}</h2>
        <p className="new-order-step__desc">{d.step1Desc}</p>
      </header>

      <div className="new-order-step__grid">
        <div className="new-order-step__full">
          <ProductSearchAutocomplete
            selectedProduct={selectedProduct}
            error={errors.productId}
            onSelect={onSelectProduct}
            onClearSelection={onClearProduct}
          />
        </div>

        <FormField label={d.company} htmlFor="company" hint={d.companyHint}>
          {companyLocked ? (
            <div className="new-order-company-lock">
              <CompanyBadge company={form.company} />
            </div>
          ) : (
            <Select
              id="company"
              value={form.company}
              onChange={(e) => onChange('company', e.target.value as OrderCompany)}
            >
              <option value="SUMO">SUMO</option>
              <option value="MAF">MAF</option>
            </Select>
          )}
        </FormField>

        <FormField
          label={`${d.productReference} *`}
          htmlFor="productReference"
          hint={catalogHint}
          error={errors.productId}
        >
          <Input
            id="productReference"
            readOnly
            hasError={Boolean(errors.productId)}
            className="order-field__input--catalog"
            value={form.productReference}
            placeholder={d.productReferencePlaceholder}
          />
        </FormField>

        <FormField
          label={`${d.product} *`}
          htmlFor="product"
          hint={catalogHint}
          error={errors.product}
        >
          <Input
            id="product"
            readOnly
            hasError={Boolean(errors.product)}
            className="order-field__input--catalog"
            value={form.product}
            placeholder={d.productReferencePlaceholder}
          />
        </FormField>

        <FormField
          label={`${d.variety} *`}
          htmlFor="variety"
          hint={catalogHint}
          error={errors.variety}
        >
          <Input
            id="variety"
            readOnly
            hasError={Boolean(errors.variety)}
            className="order-field__input--catalog"
            value={form.variety}
            placeholder={d.productReferencePlaceholder}
          />
        </FormField>

        <FormField label={d.barcode} htmlFor="barcode" hint={catalogHint}>
          <Input
            id="barcode"
            readOnly
            className="order-field__input--catalog"
            value={form.barcode}
            placeholder={d.barcodePlaceholder}
          />
        </FormField>

        <FormField label={d.boxFormat} htmlFor="boxFormat" hint={catalogHint}>
          <Input
            id="boxFormat"
            readOnly
            className="order-field__input--catalog"
            value={form.boxFormat}
            placeholder={d.productReferencePlaceholder}
          />
        </FormField>

        <FormField label={d.palletType} htmlFor="palletType" hint={catalogHint}>
          <Input
            id="palletType"
            readOnly
            className="order-field__input--catalog"
            value={palletType}
            placeholder={d.productReferencePlaceholder}
          />
        </FormField>

        <FormField label={d.heights} htmlFor="heights" hint={catalogHint}>
          <Input
            id="heights"
            readOnly
            className="order-field__input--catalog"
            value={heights}
            placeholder={d.productReferencePlaceholder}
          />
        </FormField>

        <div className="new-order-step__quantity">
          <FormField
            label={`${d.totalBoxesToProduce} *`}
            htmlFor="totalBoxes"
            hint={d.totalBoxesHint}
            error={errors.boxes}
          >
            <Input
              id="totalBoxes"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              hasError={Boolean(errors.boxes)}
              value={form.boxes}
              placeholder={d.boxesExample}
              onChange={(e) => onChange('boxes', e.target.value)}
            />
          </FormField>
        </div>
      </div>
    </section>
  )
}
