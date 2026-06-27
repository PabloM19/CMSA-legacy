import { useLanguage } from '../../../i18n/LanguageContext'
import type { TabletKpis } from '../../../utils/tabletHelpers'

interface TabletStatusCardsProps {
  kpis: TabletKpis
}

export function TabletStatusCards({ kpis }: TabletStatusCardsProps) {
  const { t } = useLanguage()
  const d = t.tablet

  const items = [
    { label: d.kpiActiveProduction, value: kpis.activeProduction },
    { label: d.kpiOccupied, value: kpis.occupiedTables },
    { label: d.kpiFree, value: kpis.freeTables },
    { label: d.kpiAlerts, value: kpis.activeAlerts },
  ]

  return (
    <div className="tablet-kpis">
      {items.map((item) => (
        <div key={item.label} className="tablet-kpi dash-card">
          <span className="tablet-kpi__value">{item.value}</span>
          <span className="tablet-kpi__label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
