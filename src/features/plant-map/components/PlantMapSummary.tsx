import {
  CheckSquare,
  Clock,
  Factory,
  LayoutGrid,
  Lock,
  Package,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantMapSummaryStats } from '../../../utils/plantMapSummaryHelpers'

interface PlantMapSummaryProps {
  stats: PlantMapSummaryStats
}

const SUMMARY_ICON_SIZE = 32

export function PlantMapSummary({ stats }: PlantMapSummaryProps) {
  const { t } = useLanguage()
  const d = t.plantMap

  const items = [
    {
      label: d.summaryFree,
      hint: d.summaryFreeHint,
      value: stats.freeTables,
      icon: LayoutGrid,
      tone: 'neutral' as const,
    },
    {
      label: d.summaryOccupied,
      hint: d.summaryOccupiedHint,
      value: stats.occupiedTables,
      icon: Factory,
      tone: 'brand' as const,
    },
    {
      label: d.summaryPending,
      hint: d.summaryPendingHint,
      value: stats.pendingValidation,
      icon: CheckSquare,
      tone: 'pending' as const,
    },
    {
      label: d.summaryWaiting,
      hint: d.summaryWaitingHint,
      value: stats.waiting,
      icon: Clock,
      tone: 'wait' as const,
    },
    {
      label: d.summaryConflict,
      hint: d.summaryConflictHint,
      value: stats.blockedOrConflict,
      icon: Lock,
      tone: 'warn' as const,
    },
    {
      label: d.summaryProduction,
      hint: d.summaryProductionHint,
      value: stats.ordersInProduction,
      icon: Package,
      tone: 'production' as const,
    },
  ]

  return (
    <section className="plant-map-summary" aria-label={d.summaryTitle}>
      <div className="plant-map-summary__grid">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <article
              key={item.label}
              className={`dash-card plant-map-summary__card plant-map-summary__card--${item.tone}`}
            >
              <span className="plant-map-summary__icon" aria-hidden="true">
                <Icon size={SUMMARY_ICON_SIZE} strokeWidth={1.5} />
              </span>
              <span className="plant-map-summary__value">{item.value}</span>
              <span className="plant-map-summary__label">{item.label}</span>
              <span className="plant-map-summary__hint">{item.hint}</span>
            </article>
          )
        })}
      </div>
    </section>
  )
}
