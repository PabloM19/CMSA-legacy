import { useLanguage } from '../../../i18n/LanguageContext'
import type { ValidationKpiCounts } from '../../../types/validation'

interface ValidationKpisProps {
  counts: ValidationKpiCounts
}

export function ValidationKpis({ counts }: ValidationKpisProps) {
  const { t } = useLanguage()
  const d = t.validation

  const items = [
    { label: d.kpiPendingOrders, value: counts.pendingOrders },
    { label: d.kpiPendingTables, value: counts.pendingTables },
    { label: d.kpiValidatedTables, value: counts.validatedTables },
    { label: d.kpiConflicts, value: counts.activeConflicts },
  ]

  return (
    <div className="validation-kpis">
      {items.map((item) => (
        <article key={item.label} className="dash-card validation-kpi">
          <span className="validation-kpi__label">{item.label}</span>
          <span className="validation-kpi__value">{item.value}</span>
        </article>
      ))}
    </div>
  )
}
