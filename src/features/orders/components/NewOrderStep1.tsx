import { CompanyBadge } from '../../../components/ui/StatusBadge'
import { FormField, Input, Select } from '../../../components/ui/FormField'
import { findProductById } from '../../../utils/productSearch'
import { useLanguage } from '../../../i18n/LanguageContext'
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
  const fromCatalog = Boolean(form.productId)

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
          hint={fromCatalog ? d.autofilledHint : undefined}
          error={errors.productId}
        >
          <Input
            id="productReference"
            readOnly={fromCatalog}
            hasError={Boolean(errors.productId)}
            className={fromCatalog ? 'order-field__input--catalog' : ''}
            value={form.productReference}
            placeholder={d.productReferencePlaceholder}
            onChange={(e) => onChange('productReference', e.target.value)}
          />
        </FormField>

        <FormField
          label={`${d.product} *`}
          htmlFor="product"
          hint={fromCatalog ? d.autofilledHint : undefined}
          error={errors.product}
        >
          <Input
            id="product"
            hasError={Boolean(errors.product)}
            className={fromCatalog ? 'order-field__input--catalog' : ''}
            value={form.product}
            onChange={(e) => onChange('product', e.target.value)}
          />
        </FormField>

        <FormField
          label={`${d.variety} *`}
          htmlFor="variety"
          hint={fromCatalog ? d.autofilledHint : undefined}
          error={errors.variety}
        >
          <Input
            id="variety"
            hasError={Boolean(errors.variety)}
            className={fromCatalog ? 'order-field__input--catalog' : ''}
            value={form.variety}
            onChange={(e) => onChange('variety', e.target.value)}
          />
        </FormField>

        <FormField
          label={d.barcode}
          htmlFor="barcode"
          hint={fromCatalog ? d.autofilledHint : undefined}
        >
          <Input
            id="barcode"
            readOnly={fromCatalog}
            className={fromCatalog ? 'order-field__input--catalog' : ''}
            value={form.barcode}
            placeholder={d.barcodePlaceholder}
            onChange={(e) => onChange('barcode', e.target.value)}
          />
        </FormField>

        <FormField
          label={d.boxFormat}
          htmlFor="boxFormat"
          hint={fromCatalog ? d.autofilledHint : undefined}
        >
          <Input
            id="boxFormat"
            className={fromCatalog ? 'order-field__input--catalog' : ''}
            value={form.boxFormat}
            onChange={(e) => onChange('boxFormat', e.target.value)}
          />
        </FormField>
      </div>
    </section>
  )
}
