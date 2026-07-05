import {
  AlertTriangle,
  CheckSquare,
  Clock,
  LayoutGrid,
  Lock,
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
      key: 'free',
      label: d.summaryFree,
      hint: d.summaryFreeHint,
      value: stats.freeTables,
      icon: LayoutGrid,
      tone: 'neutral' as const,
    },
    {
      key: 'occupied',
      label: d.summaryOccupied,
      hint: d.summaryOccupiedHint,
      value: stats.occupiedTables,
      icon: LayoutGrid,
      tone: 'brand' as const,
      breakdown: true,
    },
    {
      key: 'preparing',
      label: d.summaryPreparing,
      hint: d.summaryPreparingHint,
      value: stats.preparing,
      icon: CheckSquare,
      tone: 'pending' as const,
    },
    {
      key: 'waiting',
      label: d.summaryWaiting,
      hint: d.summaryWaitingHint,
      value: stats.waiting,
      icon: Clock,
      tone: 'wait' as const,
    },
    {
      key: 'conflict',
      label: d.summaryConflict,
      hint: d.summaryConflictHint,
      value: stats.blockedOrConflict,
      icon: Lock,
      tone: 'warn' as const,
    },
    {
      key: 'alarms',
      label: d.summaryActiveEvents,
      hint: d.summaryActiveEventsHint,
      value: stats.activeAlarms,
      icon: AlertTriangle,
      tone: 'warn' as const,
    },
  ]

  return (
    <section className="plant-map-summary" aria-label={d.summaryTitle}>
      <div className="plant-map-summary__grid">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <article
              key={item.key}
              className={`dash-card plant-map-summary__card plant-map-summary__card--${item.tone}`}
            >
              <span className="plant-map-summary__icon" aria-hidden="true">
                <Icon size={SUMMARY_ICON_SIZE} strokeWidth={1.5} />
              </span>
              <span className="plant-map-summary__value">{item.value}</span>
              <span className="plant-map-summary__label">{item.label}</span>
              <span className="plant-map-summary__hint">{item.hint}</span>
              {item.breakdown && (
                <div className="plant-map-summary__breakdown">
                  <div className="plant-map-summary__chips">
                    <span className="plant-map-summary__chip plant-map-summary__chip--sumo">
                      {d.summaryOccupiedSumo.replace('{sumo}', String(stats.occupiedSumo))}
                    </span>
                    <span className="plant-map-summary__chip plant-map-summary__chip--maf">
                      {d.summaryOccupiedMaf.replace('{maf}', String(stats.occupiedMaf))}
                    </span>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
