import { ConfirmModal } from '../../../components/ui/ConfirmModal'

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
    <ConfirmModal
      title={title}
      description={
        <>
          <p className="ui-microcopy" style={{ marginBottom: 'var(--space-3)' }}>
            Esta acción quedará registrada en auditoría mock.
          </p>
          <p>{message}</p>
        </>
      }
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
      danger={destructive}
      className="admin-confirm"
    />
  )
}
