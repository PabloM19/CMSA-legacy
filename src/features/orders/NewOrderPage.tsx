import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type {
  NewOrderFormData,
  NewOrderFormErrors,
  OrderCalculation,
  OrderCompany,
} from '../../types/newOrder'
import type { User } from '../../types/auth'
import {
  calculateOrder,
  hasFormErrors,
  validateNewOrderForm,
} from '../../utils/orderCalculation'
import { generateOrderId, saveCreatedOrder } from '../../utils/orderStorage'
import { mergeCreatedOrder } from '../../utils/backlogStorage'
import { ConfirmOrderModal } from './components/ConfirmOrderModal'
import './newOrder.css'

const CALC_DELAY_MS = 500

function resolveCompany(user: User): OrderCompany {
  if (user.company === 'SUMO' || user.company === 'MAF') return user.company
  return 'SUMO'
}

function emptyForm(company: OrderCompany): NewOrderFormData {
  return {
    company,
    reference: '',
    product: '',
    variety: '',
    type: '',
    boxFormat: '',
    boxes: '',
    boxesPerHour: '',
    notes: '',
  }
}

export function NewOrderPage() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const d = t.newOrder

  const initialCompany = useMemo(
    () => (user ? resolveCompany(user) : 'SUMO'),
    [user],
  )

  const [form, setForm] = useState<NewOrderFormData>(() => emptyForm(initialCompany))
  const [errors, setErrors] = useState<NewOrderFormErrors>({})
  const [calculating, setCalculating] = useState(false)
  const [calculation, setCalculation] = useState<OrderCalculation | null>(null)
  const [showModal, setShowModal] = useState(false)

  const companyLocked = user?.role === 'user'

  function updateField<K extends keyof NewOrderFormData>(key: K, value: NewOrderFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (calculating) return

    const validation = validateNewOrderForm(form, lang)
    setErrors(validation)
    if (hasFormErrors(validation)) return

    const boxes = Number(form.boxes)
    const boxesPerHour = Number(form.boxesPerHour)

    setCalculating(true)
    await new Promise((resolve) => setTimeout(resolve, CALC_DELAY_MS))

    const result = calculateOrder(boxes, boxesPerHour, lang)
    setCalculation(result)
    setCalculating(false)
    setShowModal(true)
  }

  function handleModify() {
    setShowModal(false)
  }

  function handleAccept() {
    if (!calculation || calculation.blocked || !user) return

    const boxes = Number(form.boxes)
    const boxesPerHour = Number(form.boxesPerHour)

    const created = {
      ...form,
      boxes,
      boxesPerHour,
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
      calculation,
    }

    saveCreatedOrder(created)
    mergeCreatedOrder(created)

    navigate('/backlog', { replace: true })
  }

  if (!user) return null

  const boxesNum = Number(form.boxes)
  const rateNum = Number(form.boxesPerHour)

  return (
    <div className="new-order">
      <PageHeader title={d.title} description={d.subtitle} showMockBadge />

      <form className="order-form dash-card" onSubmit={handleSubmit} noValidate>
        <div className="order-form__grid">
          <div className="order-field">
            <label className="order-field__label" htmlFor="company">
              {d.company}
            </label>
            {companyLocked ? (
              <div className="order-field__locked">
                <span className={`dash-chip dash-chip--${form.company.toLowerCase()}`}>
                  {form.company}
                </span>
              </div>
            ) : (
              <select
                id="company"
                className="order-field__input"
                value={form.company}
                onChange={(e) => updateField('company', e.target.value as OrderCompany)}
              >
                <option value="SUMO">SUMO</option>
                <option value="MAF">MAF</option>
              </select>
            )}
          </div>

          <div className="order-field">
            <label className="order-field__label" htmlFor="reference">
              {d.reference} *
            </label>
            <input
              id="reference"
              className={`order-field__input${errors.reference ? ' order-field__input--error' : ''}`}
              value={form.reference}
              onChange={(e) => updateField('reference', e.target.value)}
            />
            {errors.reference && (
              <span className="order-field__error">{errors.reference}</span>
            )}
          </div>

          <div className="order-field">
            <label className="order-field__label" htmlFor="product">
              {d.product} *
            </label>
            <input
              id="product"
              className={`order-field__input${errors.product ? ' order-field__input--error' : ''}`}
              value={form.product}
              onChange={(e) => updateField('product', e.target.value)}
            />
            {errors.product && <span className="order-field__error">{errors.product}</span>}
          </div>

          <div className="order-field">
            <label className="order-field__label" htmlFor="variety">
              {d.variety} *
            </label>
            <input
              id="variety"
              className={`order-field__input${errors.variety ? ' order-field__input--error' : ''}`}
              value={form.variety}
              onChange={(e) => updateField('variety', e.target.value)}
            />
            {errors.variety && <span className="order-field__error">{errors.variety}</span>}
          </div>

          <div className="order-field">
            <label className="order-field__label" htmlFor="type">
              {d.type}
            </label>
            <input
              id="type"
              className="order-field__input"
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
            />
          </div>

          <div className="order-field">
            <label className="order-field__label" htmlFor="boxFormat">
              {d.boxFormat}
            </label>
            <input
              id="boxFormat"
              className="order-field__input"
              value={form.boxFormat}
              onChange={(e) => updateField('boxFormat', e.target.value)}
            />
          </div>

          <div className="order-field">
            <label className="order-field__label" htmlFor="boxes">
              {d.boxes} *
            </label>
            <input
              id="boxes"
              type="number"
              min={0}
              step={1}
              className={`order-field__input${errors.boxes ? ' order-field__input--error' : ''}`}
              value={form.boxes}
              onChange={(e) => updateField('boxes', e.target.value)}
            />
            {errors.boxes && <span className="order-field__error">{errors.boxes}</span>}
          </div>

          <div className="order-field">
            <label className="order-field__label" htmlFor="boxesPerHour">
              {d.boxesPerHour} *
            </label>
            <input
              id="boxesPerHour"
              type="number"
              min={0}
              step={1}
              className={`order-field__input${errors.boxesPerHour ? ' order-field__input--error' : ''}`}
              value={form.boxesPerHour}
              onChange={(e) => updateField('boxesPerHour', e.target.value)}
            />
            {errors.boxesPerHour && (
              <span className="order-field__error">{errors.boxesPerHour}</span>
            )}
          </div>

          <div className="order-field order-field--full">
            <label className="order-field__label" htmlFor="notes">
              {d.notes}
            </label>
            <textarea
              id="notes"
              className="order-field__input order-field__textarea"
              rows={3}
              placeholder={d.notesPlaceholder}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </div>
        </div>

        <div className="order-form__actions">
          <button
            type="submit"
            className="order-btn order-btn--primary"
            disabled={calculating}
          >
            {calculating ? d.calculating : d.submit}
          </button>
        </div>
      </form>

      {showModal && calculation && (
        <ConfirmOrderModal
          form={form}
          boxes={boxesNum}
          boxesPerHour={rateNum}
          calculation={calculation}
          onModify={handleModify}
          onAccept={handleAccept}
        />
      )}
    </div>
  )
}
