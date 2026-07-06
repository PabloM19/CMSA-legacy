import { Link } from 'react-router-dom'
import { Eye, X } from 'lucide-react'
import { CircularMetric } from '../../../components/ui/CircularMetric'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { StationPerformanceRow } from '../../../data/mockPerformance'
import { CompanyPill } from './CompanyPill'
import { StationTypeIcon } from './StationTypeIcon'

function typeLabel(type: StationPerformanceRow['type'], d: ReturnType<typeof useLanguage>['t']['performance']) {
  if (type === 'robot') return d.typeRobot
  if (type === 'manual') return d.typeManual
  return d.typePalletizer
}

interface StationPerformanceDrawerProps {
  station: StationPerformanceRow
  onClose: () => void
}

export function StationPerformanceDrawer({ station, onClose }: StationPerformanceDrawerProps) {
  const { t } = useLanguage()
  const d = t.performance
  const typeName = typeLabel(station.type, d)
  const trendUp = station.vsYesterday >= 0

  return (
    <div className="performance-drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="performance-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="performance-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="performance-drawer__close" onClick={onClose} aria-label={d.close}>
          <X size={18} aria-hidden="true" />
        </button>

        <div className="performance-drawer__head">
          <div className="performance-drawer__station">
            <StationTypeIcon type={station.type} label={typeName} size={22} />
            <h2 id="performance-drawer-title" className="performance-drawer__title">
              {station.name}
            </h2>
          </div>
          <p className="performance-drawer__type">{typeName}</p>
          <CompanyPill company={station.company} />
        </div>

        <div className="performance-drawer__metrics">
          <div className="performance-drawer__metric">
            <CircularMetric
              value={station.efficiency}
              display={`${station.efficiency}%`}
              label={d.colEfficiency}
              size="sm"
              tone="brand"
            />
          </div>
          <div className="performance-drawer__metric">
            <CircularMetric
              value={station.occupancyPercent}
              display={`${station.occupancyPercent}%`}
              label={d.colOccupancy}
              size="sm"
              tone="sumo"
            />
          </div>
        </div>

        <dl className="performance-drawer__dl">
          <div className="performance-drawer__row">
            <dt>{d.colOrders}</dt>
            <dd>{station.ordersProcessed}</dd>
          </div>
          <div className="performance-drawer__row">
            <dt>{d.colEvents}</dt>
            <dd>
              {station.events > 0 ? (
                <span className="performance-events-badge">{station.events}</span>
              ) : (
                station.events
              )}
            </dd>
          </div>
          <div className="performance-drawer__row">
            <dt>{d.vsYesterday}</dt>
            <dd className={trendUp ? 'performance-drawer__delta--up' : 'performance-drawer__delta--down'}>
              {trendUp ? '+' : ''}
              {station.vsYesterday}%
            </dd>
          </div>
        </dl>

        <p className="performance-drawer__note">{d.drawerNote}</p>
      </aside>
    </div>
  )
}

interface PerformanceStationsTableProps {
  rows: StationPerformanceRow[]
  onSelect: (row: StationPerformanceRow) => void
}

export function PerformanceStationsTable({ rows, onSelect }: PerformanceStationsTableProps) {
  const { t } = useLanguage()
  const d = t.performance

  return (
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
              <th>{d.colAction}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const typeName = typeLabel(row.type, d)
              return (
                <tr
                  key={row.id}
                  className={`performance-stations__row performance-stations__row--${row.company?.toLowerCase() ?? 'none'}`}
                >
                  <td>
                    <span className="performance-stations__station">
                      <StationTypeIcon type={row.type} label={typeName} size={18} />
                      <span className="admin-table__cell-ref">{row.name}</span>
                    </span>
                  </td>
                  <td>{typeName}</td>
                  <td>
                    <CompanyPill company={row.company} />
                  </td>
                  <td>
                    <div className="performance-mini-bar">
                      <div className="performance-mini-bar__track">
                        <span
                          className="performance-mini-bar__fill"
                          style={{ width: `${row.occupancyPercent}%` }}
                        />
                      </div>
                      <span className="performance-mini-bar__label">{row.occupancyPercent}%</span>
                    </div>
                  </td>
                  <td>{row.ordersProcessed}</td>
                  <td>
                    {row.events > 0 ? (
                      <span className="performance-events-badge">{row.events}</span>
                    ) : (
                      row.events
                    )}
                  </td>
                  <td>
                    <div className="performance-mini-bar performance-mini-bar--efficiency">
                      <div className="performance-mini-bar__track">
                        <span
                          className="performance-mini-bar__fill performance-mini-bar__fill--efficiency"
                          style={{ width: `${row.efficiency}%` }}
                        />
                      </div>
                      <span className="performance-mini-bar__label">{row.efficiency}%</span>
                    </div>
                  </td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => onSelect(row)}
                    >
                      <Eye size={14} aria-hidden="true" />
                      {d.viewDetail}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function PerformanceGuestActions() {
  const { t } = useLanguage()

  return (
    <Link to="/login" className="ui-btn ui-btn--primary ui-btn--sm">
      {t.common.signIn}
    </Link>
  )
}
