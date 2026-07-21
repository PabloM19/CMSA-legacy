import { CircularMetric } from '../../../components/ui/CircularMetric'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PerformanceSummaryMock } from '../../../data/mockPerformance'
import { CPK_STATUS_LABEL_KEY, getCpkLevel, getCpkTone } from '../cpkHelpers'
import { CpkHelpPopover } from './CpkHelpPopover'

interface PerformanceSummaryProps {
  summary: PerformanceSummaryMock
}

export function PerformanceSummary({ summary }: PerformanceSummaryProps) {
  const { t } = useLanguage()
  const d = t.performance
  const cpkLevel = getCpkLevel(summary.cpk)
  const cpkStatusLabel = d[CPK_STATUS_LABEL_KEY[cpkLevel]]

  return (
    <section className="performance-summary" aria-label={d.summaryTitle}>
      <article className="performance-summary__card">
        <CircularMetric
          value={summary.globalEfficiency}
          display={`${summary.globalEfficiency}%`}
          label={d.kpiEfficiency}
          hint={d.vsYesterdayTrend.replace('{value}', String(summary.vsPreviousDay))}
          tone="brand"
        />
      </article>

      <article className={`performance-summary__card performance-summary__card--cpk performance-summary__card--cpk-${cpkLevel}`}>
        <CircularMetric
          value={summary.cpk}
          max={2}
          display={summary.cpk.toFixed(2)}
          label={d.kpiCpk}
          tone={getCpkTone(summary.cpk)}
        />
        <span className={`cpk-status-badge cpk-status-badge--${cpkLevel}`}>{cpkStatusLabel}</span>
        <CpkHelpPopover cpk={summary.cpk} />
      </article>

      <article className="performance-summary__card">
        <CircularMetric
          value={summary.assignedPercent}
          display={`${summary.assignedPercent}%`}
          label={d.kpiAssigned}
          tone="sumo"
        />
      </article>

      <article className="performance-summary__card">
        <CircularMetric
          value={summary.completedPercent}
          display={`${summary.completedPercent}%`}
          label={d.kpiCompleted}
          tone="maf"
        />
      </article>
    </section>
  )
}
