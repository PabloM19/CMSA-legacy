interface AdminConfirmModalProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function AdminConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  return (
    <div className="order-modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="order-modal admin-confirm"
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="order-modal__title">{title}</h2>
        <p className="admin-form__note" style={{ marginBottom: 'var(--space-sm)' }}>
          Esta acción quedará registrada en auditoría mock.
        </p>
        <p className="order-modal__notice">{message}</p>
        <div className="admin-modal__foot">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-btn${destructive ? ' admin-btn--danger' : ' admin-btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
