import {
  AlertTriangle,
  Clock,
  Cog,
  Gauge,
  LayoutGrid,
  Sparkles,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { OrderCalculation } from '../../../types/newOrder'
import {
  getAssignmentDisplayType,
  mayRequireManualTables,
} from '../../../utils/newOrderViewHelpers'

interface NewOrderImpactReviewProps {
  calculation: OrderCalculation
}

export function NewOrderImpactReview({ calculation }: NewOrderImpactReviewProps) {
  const { t } = useLanguage()
  const d = t.newOrder

  const assignmentType = getAssignmentDisplayType(calculation)
  const assignmentLabel =
    assignmentType === 'automatic'
      ? d.assignmentAutomatic
      : assignmentType === 'manual'
        ? d.assignmentManual
        : d.assignmentMixed

  const cards = [
    {
      icon: LayoutGrid,
      label: d.requiredTables,
      value: String(calculation.requiredTables),
    },
    {
      icon: Clock,
      label: d.eta,
      value: calculation.eta,
    },
    {
      icon: Clock,
      label: d.estimatedEnd,
      value: calculation.estimatedEnd,
    },
    {
      icon: Gauge,
      label: d.capacityConsumed,
      value: `${calculation.capacityConsumed}%`,
    },
    {
      icon: Cog,
      label: d.assignmentType,
      value: assignmentLabel,
    },
  ]

  return (
    <section className="new-order-step dash-card">
      <header className="new-order-step__head">
        <h2 className="new-order-step__title">{d.step3Title}</h2>
        <p className="new-order-step__desc">{d.step3Desc}</p>
      </header>

      {calculation.blocked && (
        <p className="new-order-impact__banner new-order-impact__banner--critical" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          {d.overloadNotice}
        </p>
      )}

      {mayRequireManualTables(calculation) && !calculation.blocked && (
        <p className="new-order-impact__banner new-order-impact__banner--warn">
          <Sparkles size={18} aria-hidden="true" />
          {d.manualTablesNotice}
        </p>
      )}

      <div className="new-order-impact__grid">
        {cards.map((card) => (
          <article key={card.label} className="new-order-impact-card dash-card">
            <span className="new-order-impact-card__icon" aria-hidden="true">
              <card.icon size={22} strokeWidth={1.75} />
            </span>
            <span className="new-order-impact-card__label">{card.label}</span>
            <strong className="new-order-impact-card__value">{card.value}</strong>
          </article>
        ))}
      </div>

      <section className="new-order-impact__alerts">
        <h3 className="new-order-impact__alerts-title">{d.alerts}</h3>
        {calculation.alerts.length === 0 ? (
          <p className="new-order-impact__no-alerts">{d.noAlerts}</p>
        ) : (
          <ul className="new-order-impact__alert-list">
            {calculation.alerts.map((alert) => (
              <li
                key={alert.message}
                className={`new-order-impact__alert new-order-impact__alert--${alert.type}`}
              >
                <AlertTriangle size={16} aria-hidden="true" />
                {alert.message}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
