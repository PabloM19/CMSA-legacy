import type { ReactNode } from 'react'
import { Button } from './Button'
import { ModalPortal } from './ModalPortal'

interface ConfirmModalProps {
  title: string
  description?: ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
  className?: string
}

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = false,
  className = '',
}: ConfirmModalProps) {
  return (
    <ModalPortal onEscape={onCancel}>
      <div className="ui-modal-overlay order-modal-overlay" role="presentation" onClick={onCancel}>
        <div
          className={`ui-modal order-modal${danger ? ' ui-modal--danger' : ''} ${className}`.trim()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="confirm-modal-title" className="ui-modal__title order-modal__title">
            {title}
          </h2>
          {description && <div className="ui-modal__desc">{description}</div>}
          <div className="ui-modal__actions order-modal__actions">
            <Button variant="secondary" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
