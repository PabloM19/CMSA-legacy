import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { ModalPortal } from '../../../components/ui/ModalPortal'

interface AdminDetailModalProps {
  title: string
  subtitle?: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function AdminDetailModal({
  title,
  subtitle,
  closeLabel,
  onClose,
  children,
  footer,
}: AdminDetailModalProps) {
  return (
    <ModalPortal onEscape={onClose}>
      <div className="order-modal-overlay" role="presentation" onClick={onClose}>
        <div
          className="order-modal admin-modal-dialog admin-modal-dialog--detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-detail-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="admin-modal-dialog__head">
            <button
              type="button"
              className="admin-modal-dialog__close"
              onClick={onClose}
              aria-label={closeLabel}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <h2 id="admin-detail-modal-title" className="order-modal__title admin-modal-dialog__title">
              {title}
            </h2>
            {subtitle && <p className="admin-modal-dialog__subtitle">{subtitle}</p>}
          </header>
          <div className="admin-modal-dialog__body">{children}</div>
          <footer className="admin-modal-dialog__foot">
            {footer ?? (
              <button type="button" className="admin-btn admin-btn--primary" onClick={onClose}>
                {closeLabel}
              </button>
            )}
          </footer>
        </div>
      </div>
    </ModalPortal>
  )
}
