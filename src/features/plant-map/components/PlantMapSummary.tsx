import {
  AlertTriangle,
  ClipboardCheck,
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

type SummaryBreakdown = 'company' | 'type'

interface SummaryItem {
  key: string
  label: string
  hint: string
  value: number
  icon: typeof LayoutGrid
  tone: 'neutral' | 'brand' | 'pending' | 'wait' | 'warn'
  breakdown?: SummaryBreakdown
}

export function PlantMapSummary({ stats }: PlantMapSummaryProps) {
  const { t } = useLanguage()
  const d = t.plantMap

  const items: SummaryItem[] = [
    {
      key: 'free',
      label: d.summaryFree,
      hint: d.summaryFreeHint,
      value: stats.freeTables,
      icon: LayoutGrid,
      tone: 'neutral',
      breakdown: 'type',
    },
    {
      key: 'occupied',
      label: d.summaryOccupied,
      hint: d.summaryOccupiedHint,
      value: stats.occupiedTables,
      icon: LayoutGrid,
      tone: 'brand',
      breakdown: 'company',
    },
    {
      key: 'preparing',
      label: d.summaryPreparing,
      hint: d.summaryPreparingHint,
      value: stats.preparing,
      icon: ClipboardCheck,
      tone: 'pending',
    },
    {
      key: 'waiting',
      label: d.summaryWaiting,
      hint: d.summaryWaitingHint,
      value: stats.waiting,
      icon: Clock,
      tone: 'wait',
    },
    {
      key: 'conflict',
      label: d.summaryConflict,
      hint: d.summaryConflictHint,
      value: stats.blockedOrConflict,
      icon: Lock,
      tone: 'warn',
    },
    {
      key: 'alarms',
      label: d.summaryActiveEvents,
      hint: d.summaryActiveEventsHint,
      value: stats.activeAlarms,
      icon: AlertTriangle,
      tone: 'warn',
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
              {item.breakdown === 'company' && (
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
              {item.breakdown === 'type' && (
                <div className="plant-map-summary__breakdown">
                  <div className="plant-map-summary__chips">
                    <span className="plant-map-summary__chip plant-map-summary__chip--manual">
                      {d.summaryFreeManual.replace('{count}', String(stats.freeManual))}
                    </span>
                    <span className="plant-map-summary__chip plant-map-summary__chip--robot">
                      {d.summaryFreeRobot.replace('{count}', String(stats.freeRobot))}
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
