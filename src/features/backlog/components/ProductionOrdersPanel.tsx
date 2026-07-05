import { useMemo, useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import {
  isCompletedProductionOrder,
  isInProductionColumn,
  isPendingAcceptanceColumn,
} from '../../../utils/dailyOrderHelpers'
import { BacklogOrderCard } from './BacklogOrderCard'

interface ProductionOrdersPanelProps {
  orders: BacklogOrder[]
  onViewDetail: (order: BacklogOrder) => void
  onPrepare?: (order: BacklogOrder) => void
  onConfirmCell?: (order: BacklogOrder) => void
  onWithdraw?: (order: BacklogOrder) => void
}

export function ProductionOrdersPanel({
  orders,
  onViewDetail,
  onPrepare,
  onConfirmCell,
  onWithdraw,
}: ProductionOrdersPanelProps) {
  const { t } = useLanguage()
  const d = t.backlog
  const [showCompleted, setShowCompleted] = useState(false)

  const pending = useMemo(
    () => orders.filter(isPendingAcceptanceColumn).sort((a, b) => a.priority - b.priority),
    [orders],
  )
  const inProduction = useMemo(
    () => orders.filter(isInProductionColumn).sort((a, b) => a.priority - b.priority),
    [orders],
  )
  const completed = useMemo(
    () => orders.filter(isCompletedProductionOrder).sort((a, b) => a.priority - b.priority),
    [orders],
  )

  return (
    <section className="production-orders-panel">
      <div className="production-orders-panel__head">
        <h2 className="production-orders-panel__title">{d.productionOrdersTitle}</h2>
        <label className="production-orders-panel__filter">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          {d.showCompletedFilter} ({completed.length})
        </label>
      </div>

      <div className="production-orders-panel__columns">
        <div className="production-orders-panel__column">
          <h3 className="production-orders-panel__column-title">{d.colPendingAcceptance}</h3>
          {pending.length === 0 ? (
            <p className="production-orders-panel__empty">{d.emptyPendingAcceptance}</p>
          ) : (
            <ul className="production-orders-panel__list">
              {pending.map((order) => (
                <li key={order.id}>
                  <BacklogOrderCard
                    order={order}
                    sortable={false}
                    onViewDetail={onViewDetail}
                    onPrepare={onPrepare}
                    onConfirmRecipe={onConfirmCell}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="production-orders-panel__column">
          <h3 className="production-orders-panel__column-title">{d.colInProduction}</h3>
          {inProduction.length === 0 ? (
            <p className="production-orders-panel__empty">{d.emptyInProduction}</p>
          ) : (
            <ul className="production-orders-panel__list">
              {inProduction.map((order) => (
                <li key={order.id}>
                  <BacklogOrderCard
                    order={order}
                    sortable={false}
                    onViewDetail={onViewDetail}
                    onConfirmRecipe={onConfirmCell}
                    onWithdraw={onWithdraw}
                  />
                </li>
              ))}
            </ul>
          )}

          {showCompleted && completed.length > 0 && (
            <div className="production-orders-panel__completed">
              <h4 className="production-orders-panel__completed-title">{d.completedSectionTitle}</h4>
              <ul className="production-orders-panel__list">
                {completed.map((order) => (
                  <li key={order.id}>
                    <BacklogOrderCard
                      order={order}
                      sortable={false}
                      completed
                      onViewDetail={onViewDetail}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
