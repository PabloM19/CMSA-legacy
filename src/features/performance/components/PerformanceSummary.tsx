import { TrendingDown, TrendingUp } from 'lucide-react'
import { CircularMetric } from '../../../components/ui/CircularMetric'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PerformanceSummaryMock } from '../../../data/mockPerformance'

interface PerformanceSummaryProps {
  summary: PerformanceSummaryMock
}

export function PerformanceSummary({ summary }: PerformanceSummaryProps) {
  const { t } = useLanguage()
  const d = t.performance
  const trendUp = summary.vsPreviousDay >= 0

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

      <article className="performance-summary__card">
        <CircularMetric
          value={summary.cpk}
          max={2}
          display={summary.cpk.toFixed(2)}
          label={d.kpiCpk}
          tone="brand"
        />
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

      <article className="performance-summary__card performance-summary__card--trend">
        <div
          className={`performance-trend${trendUp ? ' performance-trend--up' : ' performance-trend--down'}`}
        >
          {trendUp ? (
            <TrendingUp size={28} strokeWidth={2.25} aria-hidden="true" />
          ) : (
            <TrendingDown size={28} strokeWidth={2.25} aria-hidden="true" />
          )}
          <span className="performance-trend__value">
            {trendUp ? '+' : ''}
            {summary.vsPreviousDay}%
          </span>
        </div>
        <span className="performance-summary__card-label">{d.kpiVsYesterday}</span>
        <span className="performance-summary__card-hint">{d.kpiVsYesterdayHint}</span>
      </article>
    </section>
  )
}
