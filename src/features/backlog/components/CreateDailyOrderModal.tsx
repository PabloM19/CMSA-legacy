import { useState } from 'react'
import { CompanyBadge } from '../../../components/ui/StatusBadge'
import {
  ReferenceAutofillFields,
  ReferenceSelectField,
} from '../../../components/reference/ReferenceSelectField'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { MockProduct } from '../../../data/mockProducts'
import type { DailyOrder } from '../../../types/dailyOrder'
import type { User } from '../../../types/auth'
import type { OrderCompany } from '../../../types/newOrder'
import { createDailyOrder } from '../../../utils/dailyOrderOperations'
import { isSupervisor } from '../../../utils/permissions'

interface CreateDailyOrderModalProps {
  user: User
  dailyOrders: DailyOrder[]
  onClose: () => void
  onCreated: (dailyOrders: DailyOrder[]) => void
}

function defaultCompany(user: User): OrderCompany {
  if (user.company === 'SUMO' || user.company === 'MAF') return user.company
  return 'SUMO'
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function CreateDailyOrderModal({
  user,
  dailyOrders,
  onClose,
  onCreated,
}: CreateDailyOrderModalProps) {
  const { t } = useLanguage()
  const d = t.dailyOrdersPage

  const canPickCompany = isSupervisor(user)
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null)
  const [empresa, setEmpresa] = useState<OrderCompany>(defaultCompany(user))
  const [fecha, setFecha] = useState(todayIsoDate)
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSelectProduct(product: MockProduct | null) {
    setSelectedProduct(product)
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct) {
      setError(d.createReferenceRequired)
      return
    }
    if (!canPickCompany && empresa !== defaultCompany(user)) {
      setError(d.createErrorCompany)
      return
    }
    if (user.role === 'user' && user.company !== empresa) {
      setError(d.createErrorCompany)
      return
    }

    const result = createDailyOrder(
      dailyOrders,
      {
        estilo: selectedProduct.formatoCaja,
        referencia: selectedProduct.referenciaProducto,
        barcode: selectedProduct.barcode,
        variedad: selectedProduct.variedad,
        producto: selectedProduct.producto,
        empresa,
        fecha,
        observaciones: observaciones.trim() || undefined,
      },
      user,
    )

    onCreated(result.dailyOrders)
    onClose()
  }

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <form
        className="order-modal order-modal--neutral create-daily-order-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <header className="order-modal__head">
          <h2 className="order-modal__title">{d.createModalTitle}</h2>
          <p className="order-modal__subtitle">{d.createModalSubtitle}</p>
        </header>

        <div className="admin-form create-daily-order-modal__form">
          <ReferenceSelectField
            selectedProductId={selectedProduct?.id ?? null}
            onSelectProduct={handleSelectProduct}
            error={error && !selectedProduct ? error : undefined}
          />

          <ReferenceAutofillFields
            product={selectedProduct}
            company={canPickCompany ? null : empresa}
          />

          {canPickCompany && (
            <div className="admin-form__row">
              <label htmlFor="create-daily-company">{d.createCompanyLabel}</label>
              <select
                id="create-daily-company"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value as OrderCompany)}
              >
                <option value="SUMO">SUMO</option>
                <option value="MAF">MAF</option>
              </select>
            </div>
          )}

          {!canPickCompany && (
            <div className="admin-form__row">
              <label>{d.createCompanyLabel}</label>
              <div className="create-daily-order-modal__company-lock">
                <CompanyBadge company={empresa} />
              </div>
            </div>
          )}

          <div className="admin-form__row">
            <label htmlFor="create-daily-date">{d.createDateLabel}</label>
            <input
              id="create-daily-date"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div className="admin-form__row">
            <label htmlFor="create-daily-notes">{d.createNotesLabel}</label>
            <textarea
              id="create-daily-notes"
              rows={3}
              value={observaciones}
              placeholder={d.createNotesPlaceholder}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          {error && selectedProduct && <p className="admin-form__error">{error}</p>}
        </div>

        <div className="admin-modal__foot">
          <button type="button" className="admin-btn" onClick={onClose}>
            {t.backlog.cancel}
          </button>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={!selectedProduct}>
            {d.createConfirm}
          </button>
        </div>
      </form>
    </div>
  )
}
