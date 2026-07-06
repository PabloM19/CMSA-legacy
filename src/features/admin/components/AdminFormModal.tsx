import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { ModalPortal } from '../../../components/ui/ModalPortal'

interface AdminFormModalProps {
  title: string
  subtitle?: string
  cancelLabel: string
  saveLabel: string
  onClose: () => void
  onSave: () => void
  children: ReactNode
  wide?: boolean
}

export function AdminFormModal({
  title,
  subtitle,
  cancelLabel,
  saveLabel,
  onClose,
  onSave,
  children,
  wide = false,
}: AdminFormModalProps) {
  return (
    <ModalPortal onEscape={onClose}>
      <div className="order-modal-overlay" role="presentation" onClick={onClose}>
        <div
          className={`order-modal admin-modal-dialog${wide ? ' admin-modal-dialog--wide' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-form-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="admin-modal-dialog__head">
            <button
              type="button"
              className="admin-modal-dialog__close"
              onClick={onClose}
              aria-label={cancelLabel}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <h2 id="admin-form-modal-title" className="order-modal__title admin-modal-dialog__title">
              {title}
            </h2>
            {subtitle && <p className="admin-modal-dialog__subtitle">{subtitle}</p>}
          </header>
          <div className="admin-modal-dialog__body">{children}</div>
          <footer className="admin-modal-dialog__foot">
            <button type="button" className="admin-btn" onClick={onClose}>
              {cancelLabel}
            </button>
            <button type="button" className="admin-btn admin-btn--primary" onClick={onSave}>
              {saveLabel}
            </button>
          </footer>
        </div>
      </div>
    </ModalPortal>
  )
}
