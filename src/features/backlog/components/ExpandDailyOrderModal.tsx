import { useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DailyOrder } from '../../../types/dailyOrder'
import type { User } from '../../../types/auth'
import { expandDailyOrder } from '../../../utils/dailyOrderOperations'
import { validateDailyOrderTotal } from '../../../utils/productionOrderValidation'

interface ExpandDailyOrderModalProps {
  dailyOrders: DailyOrder[]
  daily: DailyOrder
  user: User
  onClose: () => void
  onExpanded: (dailyOrders: DailyOrder[]) => void
}

export function ExpandDailyOrderModal({
  dailyOrders,
  daily,
  user,
  onClose,
  onExpanded,
}: ExpandDailyOrderModalProps) {
  const { t, lang } = useLanguage()
  const d = t.backlog

  const [additional, setAdditional] = useState('5000')
  const [justification, setJustification] = useState('')

  const addNum = Number(additional)
  const newTotal = daily.totalCajasDia + (Number.isFinite(addNum) ? addNum : 0)
  const totalCheck = validateDailyOrderTotal(newTotal, lang)
  const blocked = !justification.trim() || addNum <= 0 || totalCheck.blocked

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (blocked) return
    const next = expandDailyOrder(
      dailyOrders,
      { pedidoDiaId: daily.id, additionalBoxes: addNum, justification: justification.trim() },
      user,
    )
    onExpanded(next)
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
        <header className="order-modal__head">
          <h2 className="order-modal__title">{d.expandModalTitle}</h2>
          <p className="order-modal__subtitle">{daily.variedad}</p>
          <p className="order-modal__meta">{d.colBoxFormat}: {daily.estilo}</p>
        </header>

        <label className="order-modal__label" htmlFor="expand-boxes">
          {d.expandAdditionalLabel}
        </label>
        <input
          id="expand-boxes"
          className="ui-input"
          type="number"
          min={1}
          value={additional}
          onChange={(e) => setAdditional(e.target.value)}
        />

        <label className="order-modal__label" htmlFor="expand-just">
          {d.expandJustificationLabel}
        </label>
        <textarea
          id="expand-just"
          className="ui-input"
          rows={3}
          required
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
        />

        <p className="expand-order-modal__notice">{d.expandAlertNotice}</p>

        {totalCheck.warnings.map((w) => (
          <p key={w} className="launch-order-modal__warn">
            {w}
          </p>
        ))}

        <div className="order-modal__actions">
          <button type="button" className="order-btn order-btn--ghost" onClick={onClose}>
            {d.cancel}
          </button>
          <button type="submit" className="order-btn order-btn--primary" disabled={blocked}>
            {d.expandConfirm}
          </button>
        </div>
      </form>
    </div>
  )
}
