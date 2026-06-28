import { AlertTriangle, CheckCircle2, ClipboardCheck } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { ValidationKpiCounts } from '../../../types/validation'
import {
  getValidationHeroMessageKey,
  getValidationHeroStatus,
  mapHeroStatusToDashClass,
} from '../../../utils/validationViewHelpers'

interface ValidationHeroProps {
  counts: ValidationKpiCounts
}

function HeroIcon({ status }: { status: ReturnType<typeof getValidationHeroStatus> }) {
  if (status === 'ready') return <CheckCircle2 size={40} strokeWidth={1.5} />
  if (status === 'conflict') return <AlertTriangle size={40} strokeWidth={1.5} />
  return <ClipboardCheck size={40} strokeWidth={1.5} />
}

export function ValidationHero({ counts }: ValidationHeroProps) {
  const { t } = useLanguage()
  const d = t.validation

  const status = getValidationHeroStatus(counts)
  const messageKey = getValidationHeroMessageKey(status)
  const dashClass = mapHeroStatusToDashClass(status)

  const stats = [
    { label: d.kpiPendingOrders, value: counts.pendingOrders },
    { label: d.kpiPendingTables, value: counts.pendingTables },
    { label: d.kpiValidatedTables, value: counts.validatedTables },
    { label: d.kpiConflicts, value: counts.activeConflicts },
  ]

  return (
    <section className={`dash-hero dash-hero--${dashClass} validation-hero`}>
      <div className="validation-hero__top">
        <div className="dash-hero__main">
          <div className="dash-hero__icon" aria-hidden="true">
            <HeroIcon status={status} />
          </div>
          <div className="dash-hero__content">
            <p className="dash-hero__label">{d.heroLabel}</p>
            <h2 className="dash-hero__title">{d[messageKey]}</h2>
            <p className="dash-hero__summary">{d.heroSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="validation-hero__stats">
        {stats.map((item) => (
          <article key={item.label} className="validation-hero__stat dash-card">
            <span className="validation-hero__stat-value">{item.value}</span>
            <span className="validation-hero__stat-label">{item.label}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
