import { CompanyBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { CompanyCapacitySummary } from '../../../utils/dashboardHelpers'

interface CompanyCapacityCardsProps {
  companies: CompanyCapacitySummary[]
}

export function CompanyCapacityCards({ companies }: CompanyCapacityCardsProps) {
  const { t } = useLanguage()
  const d = t.dashboard

  return (
    <section className="dash-card dash-capacity">
      <h2 className="dash-section-title">{d.capacityTitle}</h2>
      <div className="dash-capacity__grid">
        {companies.map((item) => (
          <article
            key={item.company}
            className={`dash-capacity__card ui-card--company-${item.company.toLowerCase()}`}
          >
            <header className="dash-capacity__head">
              <CompanyBadge company={item.company} />
            </header>

            <div className="dash-capacity__metric">
              <span className="dash-capacity__metric-value">{item.availablePercent}%</span>
              <span className="dash-capacity__metric-label">{d.capacityAvailable}</span>
            </div>

            <div className="dash-capacity__bar" aria-hidden="true">
              <div
                className="dash-capacity__bar-fill"
                style={{ width: `${item.loadPercent}%` }}
              />
            </div>

            <div className="dash-capacity__stats">
              <span>
                {d.capacityActiveOrders}: <strong>{item.activeOrders}</strong>
              </span>
              <span>
                {d.capacityOccupiedTables}:{' '}
                <strong>
                  {item.occupiedTables}/{item.totalTables}
                </strong>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
