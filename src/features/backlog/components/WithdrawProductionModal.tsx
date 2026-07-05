import { useState, type FormEvent } from 'react'
import { FormField, Select } from '../../../components/ui/FormField'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import type { WithdrawReason } from '../../../utils/withdrawProduction'

interface WithdrawProductionModalProps {
  order: BacklogOrder
  onClose: () => void
  onConfirm: (reason: WithdrawReason, comment: string) => void
  commentRequired?: boolean
}

export function WithdrawProductionModal({
  order,
  onClose,
  onConfirm,
  commentRequired = false,
}: WithdrawProductionModalProps) {
  const { t } = useLanguage()
  const d = t.backlog

  const [reason, setReason] = useState<WithdrawReason>('supervisor_decision')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!reason) {
      setError(d.withdrawReasonRequired)
      return
    }
    if (commentRequired && !comment.trim()) {
      setError(d.withdrawCommentRequired)
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
        aria-labelledby="withdraw-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="order-modal__head">
          <h2 id="withdraw-title" className="order-modal__title">
            {d.withdrawTitle}
          </h2>
          <p className="order-modal__subtitle">{d.withdrawDescription}</p>
          <p className="order-modal__subtitle">
            <strong>{order.reference}</strong> · {order.product} {order.variety}
          </p>
        </header>

        <form className="order-modal__body" onSubmit={handleSubmit}>
          <FormField label={`${d.withdrawReasonLabel} *`} htmlFor="withdraw-reason">
            <Select
              id="withdraw-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as WithdrawReason)}
            >
              <option value="incident">{d.withdrawReasonIncident}</option>
              <option value="reference_error">{d.withdrawReasonReference}</option>
              <option value="supervisor_decision">{d.withdrawReasonSupervisor}</option>
              <option value="other">{d.withdrawReasonOther}</option>
            </Select>
          </FormField>

          <FormField
            label={commentRequired ? `${d.withdrawCommentLabel} *` : d.withdrawCommentLabel}
            htmlFor="withdraw-comment"
          >
            <textarea
              id="withdraw-comment"
              className="ui-input backlog-withdraw__comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={d.withdrawCommentPlaceholder}
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
              {d.withdrawConfirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
