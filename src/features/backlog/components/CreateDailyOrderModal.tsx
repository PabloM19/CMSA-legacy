import { useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
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

export function CreateDailyOrderModal({
  user,
  dailyOrders,
  onClose,
  onCreated,
}: CreateDailyOrderModalProps) {
  const { t } = useLanguage()
  const d = t.dailyOrdersPage

  const canPickCompany = isSupervisor(user)
  const [estilo, setEstilo] = useState('')
  const [referencia, setReferencia] = useState('')
  const [barcode, setBarcode] = useState('')
  const [empresa, setEmpresa] = useState<OrderCompany>(defaultCompany(user))
  const [totalCajas, setTotalCajas] = useState('10000')
  const [boxesPerHour, setBoxesPerHour] = useState('2400')
  const [formato, setFormato] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const total = Number(totalCajas)
    if (!estilo.trim() || !referencia.trim() || !barcode.trim() || !total || total <= 0) {
      setError(t.backlog.launchValidationError)
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

    const result = createDailyOrder(dailyOrders, {
      estilo: estilo.trim(),
      referencia: referencia.trim(),
      barcode: barcode.trim(),
      empresa,
      totalCajasDia: total,
      boxesPerHour: Number(boxesPerHour) || undefined,
      formato: formato.trim() || undefined,
    }, user)

    onCreated(result.dailyOrders)
    onClose()
  }

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <form
        className="order-modal order-modal--neutral"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="order-modal__title">{d.createModalTitle}</h2>
        <div className="admin-form">
          <div className="admin-form__row">
            <label>{d.createStyleLabel}</label>
            <input value={estilo} onChange={(e) => setEstilo(e.target.value)} required />
          </div>
          <div className="admin-form__row">
            <label>{t.backlog.reference}</label>
            <input
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="REF-..."
              required
            />
          </div>
          <div className="admin-form__row">
            <label>{d.createBarcodeLabel}</label>
            <input value={barcode} onChange={(e) => setBarcode(e.target.value)} required />
          </div>
          <div className="admin-form__row">
            <label>{d.createCompanyLabel}</label>
            {canPickCompany ? (
              <select
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value as OrderCompany)}
              >
                <option value="SUMO">SUMO</option>
                <option value="MAF">MAF</option>
              </select>
            ) : (
              <input value={empresa} readOnly />
            )}
          </div>
          <div className="admin-form__grid">
            <div className="admin-form__row">
              <label>{d.createTotalLabel}</label>
              <input
                type="number"
                min={1}
                value={totalCajas}
                onChange={(e) => setTotalCajas(e.target.value)}
                required
              />
            </div>
            <div className="admin-form__row">
              <label>{d.createRateLabel}</label>
              <input
                type="number"
                min={1}
                value={boxesPerHour}
                onChange={(e) => setBoxesPerHour(e.target.value)}
              />
            </div>
          </div>
          <div className="admin-form__row">
            <label>{d.createFormatLabel}</label>
            <input value={formato} onChange={(e) => setFormato(e.target.value)} />
          </div>
          {error && <p className="admin-form__error">{error}</p>}
        </div>
        <div className="admin-modal__foot">
          <button type="button" className="admin-btn" onClick={onClose}>
            {t.backlog.cancel}
          </button>
          <button type="submit" className="admin-btn admin-btn--primary">
            {d.createConfirm}
          </button>
        </div>
      </form>
    </div>
  )
}
