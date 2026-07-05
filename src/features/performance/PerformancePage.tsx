import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useLanguage } from '../../i18n/LanguageContext'
import {
  MOCK_PERFORMANCE_SUMMARY,
  MOCK_STATION_PERFORMANCE,
  findStationPerformance,
  type StationPerformanceRow,
} from '../../data/mockPerformance'
import '../dashboard/dashboard.css'
import './performance.css'

function fmt(n: number, lang: 'es' | 'en') {
  return n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')
}

function typeLabel(type: StationPerformanceRow['type'], d: ReturnType<typeof useLanguage>['t']['performance']) {
  if (type === 'robot') return d.typeRobot
  if (type === 'manual') return d.typeManual
  return d.typePalletizer
}

function StationDrawer({
  station,
  onClose,
}: {
  station: StationPerformanceRow
  onClose: () => void
}) {
  const { t } = useLanguage()
  const d = t.performance

  return (
    <div className="performance-drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="performance-drawer"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="performance-drawer__close" onClick={onClose} aria-label={d.close}>
          ×
        </button>
        <h2 className="performance-drawer__title">{station.name}</h2>
        <p className="performance-summary__hint">{typeLabel(station.type, d)}</p>

        <dl className="order-modal__dl">
          <div className="order-modal__row">
            <dt>{d.colCompany}</dt>
            <dd>{station.company ?? '—'}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.colEfficiency}</dt>
            <dd>{station.efficiency}%</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.colOccupancy}</dt>
            <dd>{station.occupancyPercent}%</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.colOrders}</dt>
            <dd>{station.ordersProcessed}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.colEvents}</dt>
            <dd>{station.events}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.vsYesterday}</dt>
            <dd>{station.vsYesterday >= 0 ? `+${station.vsYesterday}%` : `${station.vsYesterday}%`}</dd>
          </div>
        </dl>
        <p className="performance-summary__hint">{d.drawerNote}</p>
      </aside>
    </div>
  )
}

export function PerformancePage() {
  const { t, lang } = useLanguage()
  const d = t.performance
  const summary = MOCK_PERFORMANCE_SUMMARY
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = selectedId ? findStationPerformance(selectedId) : null

  const maxProd = Math.max(summary.todayProduction, summary.yesterdayProduction)

  return (
    <div className="performance-page">
      <PageHeader title={d.title} description={d.subtitle} showMockBadge badgeLabel={d.mockBadge} />

      <section className="performance-summary" aria-label={d.summaryTitle}>
        <article className="dash-card performance-summary__card">
          <span className="performance-summary__value">{summary.globalEfficiency}%</span>
          <span className="performance-summary__label">{d.kpiEfficiency}</span>
        </article>
        <article className="dash-card performance-summary__card">
          <span className="performance-summary__value">{summary.cpk.toFixed(2)}</span>
          <span className="performance-summary__label">{d.kpiCpk}</span>
        </article>
        <article className="dash-card performance-summary__card">
          <span className="performance-summary__value">{summary.assignedPercent}%</span>
          <span className="performance-summary__label">{d.kpiAssigned}</span>
        </article>
        <article className="dash-card performance-summary__card">
          <span className="performance-summary__value">{summary.completedPercent}%</span>
          <span className="performance-summary__label">{d.kpiCompleted}</span>
        </article>
        <article className="dash-card performance-summary__card">
          <span className={`performance-summary__value performance-summary__delta--up`}>
            +{summary.vsPreviousDay}%
          </span>
          <span className="performance-summary__label">{d.kpiVsYesterday}</span>
          <span className="performance-summary__hint">{d.kpiVsYesterdayHint}</span>
        </article>
      </section>

      <section className="performance-compare dash-card">
        <h2 className="performance-compare__title">{d.compareTitle}</h2>
        <div className="performance-compare__bars">
          <div className="performance-compare__row">
            <span>{d.today}</span>
            <div className="performance-compare__track">
              <div
                className="performance-compare__fill"
                style={{ width: `${(summary.todayProduction / maxProd) * 100}%` }}
              />
            </div>
            <strong>{fmt(summary.todayProduction, lang)}</strong>
          </div>
          <div className="performance-compare__row">
            <span>{d.yesterday}</span>
            <div className="performance-compare__track">
              <div
                className="performance-compare__fill performance-compare__fill--muted"
                style={{ width: `${(summary.yesterdayProduction / maxProd) * 100}%` }}
              />
            </div>
            <strong>{fmt(summary.yesterdayProduction, lang)}</strong>
          </div>
        </div>
      </section>

      <section className="performance-stations dash-card">
        <h2 className="performance-stations__title">{d.stationsTitle}</h2>
        <div className="admin-table-wrap">
          <table className="performance-stations__table">
            <thead>
              <tr>
                <th>{d.colStation}</th>
                <th>{d.colType}</th>
                <th>{d.colCompany}</th>
                <th>{d.colOccupancy}</th>
                <th>{d.colOrders}</th>
                <th>{d.colEvents}</th>
                <th>{d.colEfficiency}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STATION_PERFORMANCE.map((row) => (
                <tr
                  key={row.id}
                  className="performance-stations__row"
                  onClick={() => setSelectedId(row.id)}
                >
                  <td className="admin-table__cell-ref">{row.name}</td>
                  <td>{typeLabel(row.type, d)}</td>
                  <td>{row.company ?? '—'}</td>
                  <td>{row.occupancyPercent}%</td>
                  <td>{row.ordersProcessed}</td>
                  <td>{row.events}</td>
                  <td>{row.efficiency}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && <StationDrawer station={selected} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
