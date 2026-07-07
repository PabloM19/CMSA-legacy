import { useState, type FormEvent } from 'react'
import { FormField, Select } from '../../../components/ui/FormField'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import type { DeleteProductionReason } from '../../../utils/deleteProductionOrder'

interface DeleteProductionOrderModalProps {
  order: BacklogOrder
  onClose: () => void
  onConfirm: (reason: DeleteProductionReason, comment: string) => void
}

export function DeleteProductionOrderModal({
  order,
  onClose,
  onConfirm,
}: DeleteProductionOrderModalProps) {
  const { t } = useLanguage()
  const d = t.backlog

  const [reason, setReason] = useState<DeleteProductionReason>('supervisor_decision')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!reason) {
      setError(d.deleteOrderReasonRequired)
      return
    }
    if (!comment.trim()) {
      setError(d.deleteOrderCommentRequired)
      return
    }
    onConfirm(reason, comment.trim())
  }

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="order-modal order-modal--neutral"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-order-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="order-modal__head">
          <h2 id="delete-order-title" className="order-modal__title">
            {d.deleteOrderTitle}
          </h2>
          <p className="order-modal__subtitle">{d.deleteOrderDescription}</p>
          <p className="order-modal__subtitle">
            <strong>{order.reference}</strong> · {order.product} {order.variety}
          </p>
        </header>

        <form className="order-modal__body" onSubmit={handleSubmit}>
          <FormField label={`${d.deleteOrderReasonLabel} *`} htmlFor="delete-order-reason">
            <Select
              id="delete-order-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as DeleteProductionReason)}
            >
              <option value="incident">{d.withdrawReasonIncident}</option>
              <option value="reference_error">{d.withdrawReasonReference}</option>
              <option value="supervisor_decision">{d.withdrawReasonSupervisor}</option>
              <option value="other">{d.withdrawReasonOther}</option>
            </Select>
          </FormField>

          <FormField label={`${d.deleteOrderCommentLabel} *`} htmlFor="delete-order-comment">
            <textarea
              id="delete-order-comment"
              className="ui-input backlog-withdraw__comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={d.deleteOrderCommentPlaceholder}
            />
          </FormField>

          {error && (
            <p className="order-modal__blocked" role="alert">
              {error}
            </p>
          )}

          <div className="order-modal__actions">
            <button type="button" className="order-btn order-btn--ghost" onClick={onClose}>
              {d.cancel}
            </button>
            <button type="submit" className="order-btn order-btn--danger">
              {d.deleteOrderConfirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
