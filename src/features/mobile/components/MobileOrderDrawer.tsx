import { Link } from 'react-router-dom'
import type { BacklogOrder } from '../../../types/backlog'
import { useLanguage } from '../../../i18n/LanguageContext'

interface MobileOrderDrawerProps {
  order: BacklogOrder | null
  onClose: () => void
}

export function MobileOrderDrawer({ order, onClose }: MobileOrderDrawerProps) {
  const { t } = useLanguage()
  const d = t.mobile

  if (!order) return null

  return (
    <div className="mobile-v2-drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="mobile-v2-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-order-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mobile-v2-drawer__head">
          <div>
            <h2 id="mobile-order-drawer-title" className="mobile-v2-drawer__title">
              {order.reference}
            </h2>
            <p className="mobile-v2-drawer__subtitle">{d.orderDetailSubtitle}</p>
          </div>
          <button type="button" className="mobile-v2-drawer__close" onClick={onClose} aria-label={d.close}>
            ×
          </button>
        </header>

        <dl className="mobile-v2-drawer__dl">
          <div>
            <dt>{d.company}</dt>
            <dd>
              <span className={`dash-chip dash-chip--${order.company.toLowerCase()}`}>
                {order.company}
              </span>
            </dd>
          </div>
          <div>
            <dt>{d.product}</dt>
            <dd>
              {order.product}
              {order.variety ? ` · ${order.variety}` : ''}
            </dd>
          </div>
          <div>
            <dt>{d.tables}</dt>
            <dd>{order.assignedTables.join(', ') || '—'}</dd>
          </div>
          {order.endTime && (
            <div>
              <dt>{d.endTime}</dt>
              <dd>{order.endTime}</dd>
            </div>
          )}
          {order.eta && (
            <div>
              <dt>{d.eta}</dt>
              <dd>{order.eta}</dd>
            </div>
          )}
        </dl>

        <div className="mobile-v2-drawer__actions">
          <Link to="/dashboard" className="mobile-v2-btn mobile-v2-btn--secondary" onClick={onClose}>
            {d.viewDashboard}
          </Link>
        </div>

        <p className="mobile-v2-drawer__note">{d.readOnlyHint}</p>
      </aside>
    </div>
  )
}
