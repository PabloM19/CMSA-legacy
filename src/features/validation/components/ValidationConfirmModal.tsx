interface ValidationConfirmModalProps {
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ValidationConfirmModal({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ValidationConfirmModalProps) {
  return (
    <div className="order-modal-overlay" role="presentation">
      <div className="order-modal validation-confirm" role="alertdialog" aria-modal="true">
        <p className="validation-confirm__text">{message}</p>
        <div className="order-modal__actions">
          <button type="button" className="order-btn order-btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="order-btn order-btn--primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
