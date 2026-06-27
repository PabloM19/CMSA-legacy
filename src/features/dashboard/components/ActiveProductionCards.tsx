import { AlertTriangle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CompanyBadge, StatusBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { ActiveProductionItem, DashboardOrder } from '../../../types/dashboard'
import { enrichProductionItem } from '../../../utils/dashboardHelpers'
import { getDashboardOrderStatusBadge } from '../../../utils/statusBadge'

interface ActiveProductionCardsProps {
  items: ActiveProductionItem[]
  orders: DashboardOrder[]
  maxItems?: number
}

export function ActiveProductionCards({
  items,
  orders,
  maxItems = 4,
}: ActiveProductionCardsProps) {
  const { t, lang } = useLanguage()
  const d = t.dashboard

  const visible = items.slice(0, maxItems)
  const hasMore = items.length > maxItems

  return (
    <section className="dash-card dash-active-cards">
      <h2 className="dash-section-title">{d.activeProduction}</h2>

      <div className="dash-active-cards__grid">
        {visible.map((item) => {
          const enriched = enrichProductionItem(item, orders)
          const statusBadge = enriched.status
            ? getDashboardOrderStatusBadge(enriched.status, lang)
            : null
          const [product, varietyFromProduct] = enriched.product.includes(' · ')
            ? enriched.product.split(' · ')
            : [enriched.product, enriched.variety]

          return (
            <article
              key={item.id}
              className={`dash-active-cards__card order-card--${item.company.toLowerCase()}`}
            >
              <div className="dash-active-cards__head">
                <strong className="dash-active-cards__ref">{item.reference}</strong>
                <CompanyBadge company={item.company} />
              </div>

              <p className="dash-active-cards__product">
                {product}
                {(varietyFromProduct || enriched.variety) && (
                  <span className="dash-active-cards__variety">
                    {' '}
                    · {varietyFromProduct ?? enriched.variety}
                  </span>
                )}
              </p>

              <div className="dash-active-cards__meta">
                <span>
                  {d.tables}: <strong>{item.occupiedTables.join(', ')}</strong>
                </span>
                <span className="dash-active-cards__meta-item">
                  <Clock size={14} aria-hidden="true" />
                  {d.remaining}: <strong>{item.remainingMinutes} {d.minutes}</strong>
                </span>
                {enriched.estimatedEnd && (
                  <span>
                    {d.endTime}: <strong>{enriched.estimatedEnd}</strong>
                  </span>
                )}
              </div>

              {statusBadge && (
                <StatusBadge label={statusBadge.label} variant={statusBadge.variant} />
              )}

              {item.alert && (
                <p className="dash-active-cards__alert">
                  <AlertTriangle size={14} aria-hidden="true" />
                  {item.alert}
                </p>
              )}

              <Link to="/backlog" className="dash-active-cards__link">
                {d.viewDetail}
              </Link>
            </article>
          )
        })}
      </div>

      {hasMore && (
        <Link to="/backlog" className="dash-active-cards__more">
          {d.viewAllBacklog}
        </Link>
      )}
    </section>
  )
}
