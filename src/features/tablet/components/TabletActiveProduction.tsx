import { useLanguage } from '../../../i18n/LanguageContext'
import type { TabletActiveOrder } from '../../../utils/tabletHelpers'

interface TabletActiveProductionProps {
  orders: TabletActiveOrder[]
}

export function TabletActiveProduction({ orders }: TabletActiveProductionProps) {
  const { t } = useLanguage()
  const d = t.tablet

  return (
    <section className="tablet-panel dash-card">
      <h2 className="tablet-panel__title">{d.activeProductionTitle}</h2>
      {orders.length === 0 ? (
        <p className="tablet-panel__empty">{d.noActiveOrders}</p>
      ) : (
        <ul className="tablet-production-list">
          {orders.map((order) => (
            <li key={order.id} className="tablet-production-item">
              <div className="tablet-production-item__head">
                <strong>{order.reference}</strong>
                <span className={`dash-chip dash-chip--${order.company.toLowerCase()}`}>
                  {order.company}
                </span>
              </div>
              <p className="tablet-production-item__meta">
                {d.tables}: {order.tables || '—'}
              </p>
              {order.remainingTime && (
                <p className="tablet-production-item__meta">
                  {d.remaining}: {order.remainingTime}
                </p>
              )}
              <p className="tablet-production-item__status">{order.status}</p>
              {order.alert && (
                <p className="tablet-production-item__alert">⚠️ {order.alert}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
