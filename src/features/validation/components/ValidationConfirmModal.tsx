import { ConfirmModal } from '../../../components/ui/ConfirmModal'
import { useLanguage } from '../../../i18n/LanguageContext'

interface ValidationConfirmModalProps {
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ValidationConfirmModal({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = false,
}: ValidationConfirmModalProps) {
  const { t } = useLanguage()

  return (
    <ConfirmModal
      title={t.validation.confirmModalTitle}
      description={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
      danger={danger}
      className="validation-confirm"
    />
  )
}
