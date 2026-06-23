import { useLanguage } from '../../../i18n/LanguageContext'
import type { DashboardKpis } from '../../../types/dashboard'

interface KpiCardsProps {
  kpis: DashboardKpis
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const { t } = useLanguage()
  const d = t.dashboard

  const items = [
    {
      label: d.kpiCapacity,
      value: `${kpis.availableCapacity}${d.kpiUnitPercent}`,
      hint: d.kpiUnitPercent,
    },
    {
      label: d.kpiOccupied,
      value: `${kpis.occupiedTables}/${kpis.totalTables}`,
      hint: d.kpiUnitTables,
    },
    {
      label: d.kpiActive,
      value: String(kpis.activeOrders),
      hint: d.kpiUnitOrders,
    },
    {
      label: d.kpiPending,
      value: String(kpis.pendingOrders),
      hint: d.kpiUnitOrders,
    },
    {
      label: d.kpiReleases,
      value: String(kpis.upcomingReleases),
      hint: d.kpiUnitOrders,
    },
  ]

  return (
    <div className="dash-kpis">
      {items.map((item) => (
        <article key={item.label} className="dash-card dash-kpi">
          <span className="dash-kpi__label">{item.label}</span>
          <span className="dash-kpi__value">{item.value}</span>
        </article>
      ))}
    </div>
  )
}
