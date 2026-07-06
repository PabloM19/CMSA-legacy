import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Package,
  TimerReset,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DailyOrdersSummaryStats } from '../../../types/dailyOrder'

interface DailyOrdersSummaryProps {
  stats: DailyOrdersSummaryStats
}

function fmt(n: number) {
  return n.toLocaleString('es-ES')
}

const KPI_ICON_SIZE = 20

type KpiTone = 'brand' | 'success' | 'neutral' | 'wait' | 'warn'

interface KpiItem {
  key: string
  value: string
  label: string
  icon: LucideIcon
  tone: KpiTone
}

export function DailyOrdersSummary({ stats }: DailyOrdersSummaryProps) {
  const { t } = useLanguage()
  const d = t.backlog

  const items: KpiItem[] = [
    {
      key: 'total',
      value: fmt(stats.totalCajasDia),
      label: d.kpiTotalDayBoxes,
      icon: Package,
      tone: 'brand',
    },
    {
      key: 'assigned',
      value: fmt(stats.cajasAsignadas),
      label: d.kpiAssignedBoxes,
      icon: ClipboardCheck,
      tone: 'brand',
    },
    {
      key: 'completed',
      value: fmt(stats.cajasCompletadas),
      label: d.kpiCompletedBoxes,
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      key: 'remaining',
      value: fmt(stats.cajasRestantes),
      label: d.kpiRemainingBoxes,
      icon: TimerReset,
      tone: 'wait',
    },
    {
      key: 'orders',
      value: fmt(stats.ordenesEnProduccion),
      label: d.kpiProductionOrders,
      icon: Factory,
      tone: 'neutral',
    },
    {
      key: 'events',
      value: fmt(stats.eventosActivos),
      label: d.kpiActiveEvents,
      icon: AlertTriangle,
      tone: 'warn',
    },
  ]

  return (
    <section className="daily-orders-summary" aria-label={d.summaryTitle}>
      <header className="daily-orders-summary__header">
        <div className="daily-orders-summary__header-main">
          <h2 className="daily-orders-summary__title">{d.summaryTitle}</h2>
          <p className="daily-orders-summary__meta">{d.summaryDate}: 15/01/2025</p>
        </div>
        <span className="daily-orders-summary__badge">{d.simulatedBadge}</span>
      </header>

      <div className="daily-orders-summary__grid">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <article
              key={item.key}
              className={`daily-orders-summary__item daily-orders-summary__item--${item.tone}`}
            >
              <span className="daily-orders-summary__icon" aria-hidden="true">
                <Icon size={KPI_ICON_SIZE} strokeWidth={1.75} />
              </span>
              <span className="daily-orders-summary__value">{item.value}</span>
              <span className="daily-orders-summary__label">{item.label}</span>
            </article>
          )
        })}
      </div>
    </section>
  )
}
