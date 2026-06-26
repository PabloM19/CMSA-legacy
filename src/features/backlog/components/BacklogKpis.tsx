import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogKpiCounts } from '../../../types/backlog'

interface BacklogKpisProps {
  counts: BacklogKpiCounts
}

export function BacklogKpis({ counts }: BacklogKpisProps) {
  const { t } = useLanguage()
  const d = t.backlog

  const items = [
    { key: 'total', label: d.kpiTotal, value: counts.total },
    { key: 'queue', label: d.kpiQueue, value: counts.inQueue, isQueue: true },
    { key: 'validation', label: d.kpiValidation, value: counts.pendingValidation },
    { key: 'execution', label: d.kpiExecution, value: counts.inExecution },
    { key: 'blocked', label: d.kpiBlocked, value: counts.blocked },
    { key: 'completed', label: d.kpiCompleted, value: counts.completed },
  ]

  return (
    <div className="backlog-kpis">
      {items.map((item) => (
        <article key={item.key} className="dash-card backlog-kpi">
          <span className="backlog-kpi__label">{item.label}</span>
          <span className="backlog-kpi__value">{item.value}</span>
          {item.isQueue && (
            <span className="backlog-kpi__detail">
              {d.kpiQueueBacklog}: {counts.inBacklog} · {d.kpiQueueLaunch}: {counts.pendingLaunch}
            </span>
          )}
        </article>
      ))}
    </div>
  )
}
