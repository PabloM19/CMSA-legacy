import { X } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogColumnId, BacklogOrder } from '../../../types/backlog'
import { BacklogOrderCard } from './BacklogOrderCard'

interface BacklogColumnDrawerProps {
  columnId: BacklogColumnId
  orders: BacklogOrder[]
  onClose: () => void
  onViewDetail: (order: BacklogOrder) => void
  onPrepare: (order: BacklogOrder) => void
  onConfirmRecipe: (order: BacklogOrder) => void
  onWithdraw?: (order: BacklogOrder) => void
}

export function BacklogColumnDrawer({
  columnId,
  orders,
  onClose,
  onViewDetail,
  onPrepare,
  onConfirmRecipe,
  onWithdraw,
}: BacklogColumnDrawerProps) {
  const { t } = useLanguage()
  const d = t.backlog

  return (
    <div className="backlog-drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="backlog-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backlog-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="backlog-drawer__head">
          <div>
            <h2 id="backlog-drawer-title" className="backlog-drawer__title">
              {d.columns[columnId]}
            </h2>
            <p className="backlog-drawer__subtitle">
              {d.drawerSubtitle.replace('{count}', String(orders.length))}
            </p>
          </div>
          <button type="button" className="backlog-drawer__close" onClick={onClose} aria-label={d.drawerClose}>
            <X size={22} />
          </button>
        </header>

        <div className="backlog-drawer__list">
          {orders.length === 0 ? (
            <p className="backlog-column__empty">{d.columnEmpty}</p>
          ) : (
            orders.map((order) => (
              <BacklogOrderCard
                key={order.id}
                order={order}
                sortable={false}
                completed={columnId === 'finalizado'}
                onViewDetail={onViewDetail}
                onPrepare={onPrepare}
                onConfirmRecipe={onConfirmRecipe}
                onWithdraw={onWithdraw}
              />
            ))
          )}
        </div>
      </aside>
    </div>
  )
}
