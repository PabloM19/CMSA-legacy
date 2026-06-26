import { useLanguage } from '../../../i18n/LanguageContext'
import type { TabletActiveOrder } from '../../../utils/tabletHelpers'

interface TabletActiveProductionProps {
  orders: TabletActiveOrder[]
}

export function TabletActiveProduction({ orders }: TabletActiveProductionProps) {
  const { t } = useLanguage()
  const d = t.tablet

  return (
    <section className="tablet-panel tablet-panel--scroll dash-card">
      <h2 className="tablet-panel__title">{d.activeProductionTitle}</h2>
      {orders.length === 0 ? (
        <p className="tablet-panel__empty">{d.noActiveOrders}</p>
      ) : (
        <ul className="tablet-production-scroll">
          {orders.map((order) => (
            <li
              key={order.id}
              className={`tablet-production-card tablet-production-card--${order.company.toLowerCase()}`}
            >
              <div className="tablet-production-card__head">
                <strong>{order.reference}</strong>
                <span className={`tablet-chip tablet-chip--${order.company.toLowerCase()}`}>
                  {order.company}
                </span>
              </div>
              <p className="tablet-production-card__product">{order.product}</p>
              <p className="tablet-production-card__meta">
                {d.tables}: {order.tables || '—'}
              </p>
              {order.remainingTime && (
                <p className="tablet-production-card__meta tablet-production-card__meta--strong">
                  {order.remainingTime}
                </p>
              )}
              {order.endTime && (
                <p className="tablet-production-card__meta">
                  {d.endTime}: {order.endTime}
                </p>
              )}
              {order.eta && (
                <p className="tablet-production-card__meta">
                  {d.eta}: {order.eta}
                </p>
              )}
              <p className="tablet-production-card__status">{order.status}</p>
              {order.alert && (
                <p className="tablet-production-card__alert">⚠ {order.alert}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
