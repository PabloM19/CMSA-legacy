import { AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogKpiCounts } from '../../../types/backlog'
import { getBacklogHeroMessageKey, getBacklogHeroStatus } from '../../../utils/backlogHelpers'

interface BacklogHeroProps {
  counts: BacklogKpiCounts
}

function HeroIcon({ status }: { status: ReturnType<typeof getBacklogHeroStatus> }) {
  if (status === 'ok') return <CheckCircle2 size={28} strokeWidth={1.5} />
  if (status === 'pending_preparation') return <ClipboardList size={28} strokeWidth={1.5} />
  return <AlertTriangle size={28} strokeWidth={1.5} />
}

export function BacklogHero({ counts }: BacklogHeroProps) {
  const { t } = useLanguage()
  const d = t.backlog

  const status = getBacklogHeroStatus(counts)
  const messageKey = getBacklogHeroMessageKey(status)

  const summaryParts = [
    d.heroSummaryTotal.replace('{total}', String(counts.total)),
    d.heroSummaryQueue.replace('{queue}', String(counts.inQueue)),
    d.heroSummaryPreparation.replace('{preparation}', String(counts.inPreparation)),
    d.heroSummaryExecution.replace('{execution}', String(counts.inProduction)),
    d.heroSummaryCompleted.replace('{completed}', String(counts.completed)),
  ]

  return (
    <section className={`dash-hero dash-hero--${status === 'ok' ? 'ok' : status === 'incidents' ? 'critical' : 'warning'}`}>
      <div className="dash-hero__main">
        <div className="dash-hero__icon" aria-hidden="true">
          <HeroIcon status={status} />
        </div>
        <div className="dash-hero__content">
          <p className="dash-hero__label">{d.heroLabel}</p>
          <h2 className="dash-hero__title">{d[messageKey]}</h2>
          <p className="dash-hero__summary">{summaryParts.join(' · ')}</p>
        </div>
      </div>
    </section>
  )
}
