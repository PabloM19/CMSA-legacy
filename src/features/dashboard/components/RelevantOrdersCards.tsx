import { AlertTriangle } from 'lucide-react'
import { CompanyBadge, StatusBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DashboardOrder } from '../../../types/dashboard'
import { getDashboardOrderStatusBadge } from '../../../utils/statusBadge'

interface RelevantOrdersCardsProps {
  orders: DashboardOrder[]
}

export function RelevantOrdersCards({ orders }: RelevantOrdersCardsProps) {
  const { t, lang } = useLanguage()
  const d = t.dashboard

  if (orders.length === 0) return null

  return (
    <section className="dash-card dash-relevant">
      <h2 className="dash-section-title">{d.relevantOrdersTitle}</h2>
      <div className="dash-relevant__grid">
        {orders.map((order) => {
          const statusBadge = getDashboardOrderStatusBadge(order.status, lang)
          return (
            <article
              key={order.id}
              className={`dash-relevant__card order-card--${order.company.toLowerCase()}`}
            >
              <div className="dash-relevant__head">
                <strong>{order.reference}</strong>
                <CompanyBadge company={order.company} />
              </div>
              <p className="dash-relevant__product">
                {order.product} · {order.variety}
              </p>
              <div className="dash-relevant__meta">
                <StatusBadge label={statusBadge.label} variant={statusBadge.variant} />
                {order.assignedTables.length > 0 && (
                  <span className="dash-relevant__tables">
                    {d.tables}: {order.assignedTables.join(', ')}
                  </span>
                )}
              </div>
              {order.alerts.length > 0 && (
                <p className="dash-relevant__alert">
                  <AlertTriangle size={14} aria-hidden="true" />
                  {order.alerts.join(' · ')}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
