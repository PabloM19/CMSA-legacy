import { useState, type FormEvent } from 'react'
import { FormField, Input, Select } from '../../../components/ui/FormField'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { MockProduct } from '../../../data/mockProducts'
import {
  referenceExists,
  saveCustomReference,
  updateCustomReference,
} from '../../../utils/productCatalogStorage'

interface AddReferenceModalProps {
  onClose: () => void
  onSaved: (product: MockProduct) => void
  initial?: MockProduct
}

export function AddReferenceModal({ onClose, onSaved, initial }: AddReferenceModalProps) {
  const { t } = useLanguage()
  const d = t.newOrder
  const isEdit = Boolean(initial?.id.startsWith('custom-'))

  const [referencia, setReferencia] = useState(initial?.referenciaProducto ?? '')
  const [barcode, setBarcode] = useState(initial?.barcode ?? '')
  const [variedad, setVariedad] = useState(initial?.variedad ?? '')
  const [calibre, setCalibre] = useState(initial?.calibre ?? '')
  const [formatoCaja, setFormatoCaja] = useState(initial?.formatoCaja ?? '')
  const [uso, setUso] = useState(initial?.uso ?? 'Mesa')
  const [cajasHora, setCajasHora] = useState(String(initial?.cajasHoraSugeridas ?? 500))
  const [activo, setActivo] = useState(initial?.activo ?? true)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!referencia.trim() || !barcode.trim() || !variedad.trim() || !calibre.trim() || !formatoCaja.trim()) {
      setError(d.addReferenceRequired)
      return
    }

    if (!isEdit && referenceExists(referencia)) {
      setError(d.addReferenceDuplicate)
      return
    }

    const rate = Number(cajasHora)
    if (!rate || rate <= 0) {
      setError(d.addReferenceRateInvalid)
      return
    }

    const payload = {
      referenciaProducto: referencia,
      barcode,
      variedad,
      calibre,
      formatoCaja,
      uso,
      cajasHoraSugeridas: rate,
      activo,
    }

    const saved =
      isEdit && initial
        ? updateCustomReference(initial.id, payload) ?? saveCustomReference(payload)
        : saveCustomReference(payload)

    onSaved(saved)
    onClose()
  }

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="order-modal order-modal--neutral order-modal--reference"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-reference-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="order-modal__head">
          <h2 id="add-reference-title" className="order-modal__title">
            {isEdit ? d.editReferenceTitle : d.addReferenceTitle}
          </h2>
          <p className="order-modal__subtitle">{d.addReferenceSubtitle}</p>
        </header>

        <form className="order-modal__body" onSubmit={handleSubmit}>
          <div className="add-reference-form">
            <FormField label={`${d.productReference} *`} htmlFor="ref-referencia">
              <Input id="ref-referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
            </FormField>
            <FormField label={`${d.barcode} *`} htmlFor="ref-barcode">
              <Input id="ref-barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
            </FormField>
            <FormField label={d.product} htmlFor="ref-producto">
              <Input id="ref-producto" value="Naranja" readOnly />
            </FormField>
            <FormField label={`${d.variety} *`} htmlFor="ref-variedad">
              <Input id="ref-variedad" value={variedad} onChange={(e) => setVariedad(e.target.value)} />
            </FormField>
            <FormField label={`${d.calibre} *`} htmlFor="ref-calibre">
              <Input id="ref-calibre" value={calibre} onChange={(e) => setCalibre(e.target.value)} />
            </FormField>
            <FormField label={`${d.boxFormat} *`} htmlFor="ref-formato">
              <Input id="ref-formato" value={formatoCaja} onChange={(e) => setFormatoCaja(e.target.value)} />
            </FormField>
            <FormField label={`${d.usage} *`} htmlFor="ref-uso">
              <Select id="ref-uso" value={uso} onChange={(e) => setUso(e.target.value)}>
                <option value="Mesa">Mesa</option>
                <option value="Paletizador">Paletizador</option>
                <option value="Mixto">Mixto</option>
              </Select>
            </FormField>
            <FormField label={d.suggestedRate} htmlFor="ref-rate">
              <Input
                id="ref-rate"
                type="number"
                min={1}
                value={cajasHora}
                onChange={(e) => setCajasHora(e.target.value)}
              />
            </FormField>
            <label className="add-reference-form__check">
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
              {d.referenceActive}
            </label>
          </div>

          {error && (
            <p className="order-modal__blocked" role="alert">
              {error}
            </p>
          )}

          <div className="order-modal__actions">
            <button type="button" className="order-btn order-btn--ghost order-btn--large" onClick={onClose}>
              {d.addReferenceCancel}
            </button>
            <button type="submit" className="order-btn order-btn--primary order-btn--large">
              {d.addReferenceSave}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
