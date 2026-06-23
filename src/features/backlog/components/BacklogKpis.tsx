import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogKpiCounts } from '../../../types/backlog'

interface BacklogKpisProps {
  counts: BacklogKpiCounts
}

export function BacklogKpis({ counts }: BacklogKpisProps) {
  const { t } = useLanguage()
  const d = t.backlog

  const items = [
    { label: d.kpiTotal, value: counts.total },
    { label: d.kpiBacklog, value: counts.enBacklog },
    { label: d.kpiValidation, value: counts.pendingValidation },
    { label: d.kpiExecution, value: counts.inExecution },
    { label: d.kpiBlocked, value: counts.blocked },
  ]

  return (
    <div className="backlog-kpis">
      {items.map((item) => (
        <article key={item.label} className="dash-card backlog-kpi">
          <span className="backlog-kpi__label">{item.label}</span>
          <span className="backlog-kpi__value">{item.value}</span>
        </article>
      ))}
    </div>
  )
}
