interface TabletConfirmModalProps {
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function TabletConfirmModal({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: TabletConfirmModalProps) {
  return (
    <div className="order-modal-overlay" role="presentation">
      <div className="order-modal tablet-confirm" role="alertdialog" aria-modal="true">
        <p className="tablet-confirm__text">{message}</p>
        <div className="tablet-confirm__actions">
          <button type="button" className="tablet-action tablet-action--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="tablet-action tablet-action--primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
