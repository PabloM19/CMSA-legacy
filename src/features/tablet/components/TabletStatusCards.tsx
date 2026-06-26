import { useLanguage } from '../../../i18n/LanguageContext'
import type { TabletGeneralStatus, TabletKpis } from '../../../utils/tabletHelpers'

interface TabletStatusCardsProps {
  generalStatus: TabletGeneralStatus
  kpis: TabletKpis
}

export function TabletStatusCards({ generalStatus, kpis }: TabletStatusCardsProps) {
  const { t } = useLanguage()
  const d = t.tablet

  const statusLabel =
    generalStatus === 'critical'
      ? d.statusCritical
      : generalStatus === 'warning'
        ? d.statusWarning
        : d.statusOk

  const items = [
    { label: d.kpiActiveProduction, value: kpis.activeProduction },
    { label: d.kpiOccupied, value: kpis.occupiedTables },
    { label: d.kpiFree, value: kpis.freeTables },
    { label: d.kpiAlerts, value: kpis.activeAlerts },
    { label: d.kpiFinishingSoon, value: kpis.finishingSoon },
  ]

  return (
    <div className="tablet-status-strip dash-card">
      <div className={`tablet-status-strip__general tablet-status-strip__general--${generalStatus}`}>
        <span className="tablet-status-strip__general-label">{d.generalStatus}</span>
        <strong>{statusLabel}</strong>
      </div>
      <div className="tablet-status-strip__kpis">
        {items.map((item) => (
          <div key={item.label} className="tablet-status-strip__kpi">
            <span className="tablet-status-strip__kpi-value">{item.value}</span>
            <span className="tablet-status-strip__kpi-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
