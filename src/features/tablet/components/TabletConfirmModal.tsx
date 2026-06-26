interface TabletConfirmModalProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function TabletConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
}: TabletConfirmModalProps) {
  return (
    <div className="order-modal-overlay" role="presentation">
      <div className="order-modal tablet-confirm" role="alertdialog" aria-modal="true">
        <h3 className="tablet-confirm__title">{title}</h3>
        <p className="tablet-confirm__text">{message}</p>
        <div className="tablet-confirm__actions">
          <button type="button" className="tablet-action tablet-action--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`tablet-action${destructive ? ' tablet-action--danger' : ' tablet-action--primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
