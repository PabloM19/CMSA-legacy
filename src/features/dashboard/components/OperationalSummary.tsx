import { useLanguage } from '../../../i18n/LanguageContext'
import type { DashboardOperationalCounts } from '../../../utils/dashboardHelpers'

interface OperationalSummaryProps {
  counts: DashboardOperationalCounts
}

export function OperationalSummary({ counts }: OperationalSummaryProps) {
  const { t } = useLanguage()
  const d = t.dashboard

  const items = [
    { label: d.summaryInQueue, value: counts.inQueue, hint: d.summaryInQueueHint },
    {
      label: d.summaryPendingValidation,
      value: counts.pendingValidation,
      hint: d.summaryPendingValidationHint,
    },
    {
      label: d.summaryInExecution,
      value: counts.inExecution,
      hint: d.summaryInExecutionHint,
    },
    { label: d.summaryBlocked, value: counts.blocked, hint: d.summaryBlockedHint },
    { label: d.summaryFreeTables, value: counts.freeTables, hint: d.summaryFreeTablesHint },
    {
      label: d.summaryOccupiedTables,
      value: counts.occupiedTables,
      hint: d.summaryOccupiedTablesHint,
    },
  ]

  return (
    <section className="dash-card dash-op-summary">
      <h2 className="dash-section-title">{d.operationalSummaryTitle}</h2>
      <div className="dash-op-summary__grid">
        {items.map((item) => (
          <article key={item.label} className="dash-op-summary__item">
            <span className="dash-op-summary__label">{item.label}</span>
            <span className="ui-kpi-value dash-op-summary__value">{item.value}</span>
            <span className="dash-op-summary__hint">{item.hint}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
