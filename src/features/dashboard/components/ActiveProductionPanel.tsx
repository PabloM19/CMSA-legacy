import { AlertTriangle, Clock } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { ActiveProductionItem } from '../../../types/dashboard'

interface ActiveProductionPanelProps {
  items: ActiveProductionItem[]
}

export function ActiveProductionPanel({ items }: ActiveProductionPanelProps) {
  const { t } = useLanguage()
  const d = t.dashboard

  return (
    <section className="dash-card dash-production">
      <h2 className="dash-section-title">{d.activeProduction}</h2>
      <div className="dash-production__list">
        {items.map((item) => (
          <article key={item.id} className="dash-production__item">
            <div className="dash-production__head">
              <span className={`dash-chip dash-chip--${item.company.toLowerCase()}`}>
                {item.company}
              </span>
              <span className="dash-table__mono">{item.reference}</span>
            </div>
            <p className="dash-production__product">{item.product}</p>
            <div className="dash-production__stats">
              <span className="dash-production__stat">
                <Clock size={14} aria-hidden="true" />
                {d.remaining}: <strong>{item.remainingMinutes} {d.minutes}</strong>
              </span>
              <span className="dash-production__stat">
                {d.occupiedTables}: <strong>{item.occupiedTables.join(', ')}</strong>
              </span>
            </div>
            {item.alert && (
              <p className="dash-production__alert">
                <AlertTriangle size={14} aria-hidden="true" />
                {item.alert}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
