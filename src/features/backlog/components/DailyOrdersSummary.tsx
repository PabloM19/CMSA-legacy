import { useLanguage } from '../../../i18n/LanguageContext'
import type { DailyOrdersSummaryStats } from '../../../types/dailyOrder'
import { DEMO_DAILY_ORDERS_TOTAL } from '../../../data/mockDailyOrders'

interface DailyOrdersSummaryProps {
  stats: DailyOrdersSummaryStats
}

function fmt(n: number) {
  return n.toLocaleString('es-ES')
}

export function DailyOrdersSummary({ stats }: DailyOrdersSummaryProps) {
  const { t } = useLanguage()
  const d = t.backlog

  return (
    <section className="daily-orders-summary dash-card" aria-label={d.summaryTitle}>
      <div className="daily-orders-summary__grid">
        <div className="daily-orders-summary__item">
          <span className="daily-orders-summary__value">{fmt(stats.totalCajasDia)}</span>
          <span className="daily-orders-summary__label">{d.kpiTotalDayBoxes}</span>
        </div>
        <div className="daily-orders-summary__item">
          <span className="daily-orders-summary__value">{fmt(stats.cajasAsignadas)}</span>
          <span className="daily-orders-summary__label">{d.kpiAssignedBoxes}</span>
        </div>
        <div className="daily-orders-summary__item">
          <span className="daily-orders-summary__value">{fmt(stats.cajasCompletadas)}</span>
          <span className="daily-orders-summary__label">{d.kpiCompletedBoxes}</span>
        </div>
        <div className="daily-orders-summary__item">
          <span className="daily-orders-summary__value">{fmt(stats.cajasRestantes)}</span>
          <span className="daily-orders-summary__label">{d.kpiRemainingBoxes}</span>
        </div>
        <div className="daily-orders-summary__item">
          <span className="daily-orders-summary__value">{stats.ordenesEnProduccion}</span>
          <span className="daily-orders-summary__label">{d.kpiProductionOrders}</span>
        </div>
        <div className="daily-orders-summary__item">
          <span className="daily-orders-summary__value">{stats.eventosActivos}</span>
          <span className="daily-orders-summary__label">{d.kpiActiveEvents}</span>
        </div>
      </div>
      <p className="daily-orders-summary__meta">
        {d.summaryDate}: 15/01/2025 · {d.summaryGrandTotal}: {fmt(DEMO_DAILY_ORDERS_TOTAL)}
      </p>
    </section>
  )
}
