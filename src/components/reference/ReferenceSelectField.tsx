import { useMemo } from 'react'
import { FormField, Input, Select } from '../ui/FormField'
import { useLanguage } from '../../i18n/LanguageContext'
import type { MockProduct } from '../../data/mockProducts'
import type { OrderCompany } from '../../types/newOrder'
import { findProductById, getCatalogReferenceOptions } from '../../utils/productSearch'

interface ReferenceSelectFieldProps {
  selectedProductId: string | null
  onSelectProduct: (product: MockProduct | null) => void
  error?: string
  readOnly?: boolean
  id?: string
}

interface ReferenceAutofillFieldsProps {
  product: MockProduct | null
  company?: OrderCompany | null
  className?: string
}

export function ReferenceSelectField({
  selectedProductId,
  onSelectProduct,
  error,
  readOnly = false,
  id = 'reference-select',
}: ReferenceSelectFieldProps) {
  const { t } = useLanguage()
  const d = t.dailyOrdersPage
  const options = useMemo(() => getCatalogReferenceOptions(), [])

  return (
    <FormField
      label={`${d.createReferenceLabel} *`}
      htmlFor={id}
      hint={readOnly ? d.createReferenceLockedHint : d.createReferenceHint}
      error={error}
    >
      <Select
        id={id}
        value={selectedProductId ?? ''}
        disabled={readOnly}
        hasError={Boolean(error)}
        required={!readOnly}
        onChange={(e) => {
          const nextId = e.target.value
          if (!nextId) {
            onSelectProduct(null)
            return
          }
          onSelectProduct(findProductById(nextId) ?? null)
        }}
      >
        <option value="">{d.createReferencePlaceholder}</option>
        {options.map((product) => (
          <option key={product.id} value={product.id}>
            {product.referenciaProducto} — {product.variedad} · {product.calibre}
          </option>
        ))}
      </Select>
    </FormField>
  )
}

export function ReferenceAutofillFields({
  product,
  company,
  className = '',
}: ReferenceAutofillFieldsProps) {
  const { t } = useLanguage()
  const d = t.dailyOrdersPage

  if (!product) return null

  return (
    <div className={`reference-autofill ${className}`.trim()}>
      <p className="reference-autofill__hint">{d.createAutofilledHint}</p>
      <div className="reference-autofill__grid">
        <FormField label={d.createBarcodeLabel} htmlFor="ref-autofill-barcode">
          <Input id="ref-autofill-barcode" readOnly value={product.barcode} />
        </FormField>
        <FormField label={d.createVarietyLabel} htmlFor="ref-autofill-variety">
          <Input
            id="ref-autofill-variety"
            readOnly
            value={`${product.producto} · ${product.variedad}`}
          />
        </FormField>
        <FormField label={d.createFormatLabel} htmlFor="ref-autofill-format">
          <Input id="ref-autofill-format" readOnly value={product.formatoCaja} />
        </FormField>
        {company && (
          <FormField label={d.createCompanyLabel} htmlFor="ref-autofill-company">
            <Input id="ref-autofill-company" readOnly value={company} />
          </FormField>
        )}
      </div>
    </div>
  )
}
