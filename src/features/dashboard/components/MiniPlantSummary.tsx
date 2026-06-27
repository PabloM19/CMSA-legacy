import { Link } from 'react-router-dom'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantSummaryCounts } from '../../../utils/dashboardHelpers'

interface MiniPlantSummaryProps {
  summary: PlantSummaryCounts
}

export function MiniPlantSummary({ summary }: MiniPlantSummaryProps) {
  const { t } = useLanguage()
  const d = t.dashboard

  const items = [
    { label: d.miniPlantFree, value: summary.free, tone: 'free' },
    { label: d.miniPlantOccupied, value: summary.occupied, tone: 'occupied' },
    { label: d.miniPlantBlocked, value: summary.blocked, tone: 'blocked' },
    { label: d.miniPlantPending, value: summary.pending, tone: 'pending' },
  ]

  return (
    <section className="dash-card dash-mini-plant">
      <h2 className="dash-section-title">{d.miniPlantTitle}</h2>
      <div className="dash-mini-plant__grid">
        {items.map((item) => (
          <div key={item.label} className={`dash-mini-plant__stat dash-mini-plant__stat--${item.tone}`}>
            <span className="dash-mini-plant__value">{item.value}</span>
            <span className="dash-mini-plant__label">{item.label}</span>
          </div>
        ))}
      </div>
      <Link to="/plant-map" className="ui-btn ui-btn--secondary ui-btn--md dash-mini-plant__btn">
        {d.actionPlant}
      </Link>
    </section>
  )
}
