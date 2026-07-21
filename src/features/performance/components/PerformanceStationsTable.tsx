import { Fragment, useMemo, useState } from 'react'
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

function statusLabel(status: StationPerformanceRow['status'], d: ReturnType<typeof useLanguage>['t']['performance']) {
  if (status === 'producing') return d.statusProducing
  if (status === 'waiting') return d.statusWaiting
  if (status === 'blocked') return d.statusBlocked
  return d.statusIdle
}

function fmtRate(n: number, lang: 'es' | 'en') {
  return n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')
}

interface StationPerformanceDrawerProps {
  station: StationPerformanceRow
  onClose: () => void
}

export function StationPerformanceDrawer({ station, onClose }: StationPerformanceDrawerProps) {
  const { t, lang } = useLanguage()
  const d = t.performance
  const typeName = typeLabel(station.type, d)
  const trendUp = station.vsYesterday >= 0
  const capacityLabel = `${fmtRate(station.currentBoxesPerHour, lang)} / ${fmtRate(station.maxBoxesPerHour, lang)} ${d.boxesPerHourShort}`

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

        <div className="performance-drawer__hero">
          <CircularMetric
            value={station.efficiency}
            display={`${station.efficiency}%`}
            label={d.colEfficiency}
            tone="brand"
          />
          <p className="performance-drawer__help">{d.efficiencyHelp}</p>
        </div>

        <div className="performance-drawer__capacity">
          <span className="performance-drawer__capacity-label">{d.capacityUsed}</span>
          <strong className="performance-drawer__capacity-value">{capacityLabel}</strong>
        </div>

        <dl className="performance-drawer__dl">
          <div className="performance-drawer__row">
            <dt>{d.colStatus}</dt>
            <dd>{statusLabel(station.status, d)}</dd>
          </div>
          <div className="performance-drawer__row">
            <dt>{d.colCompany}</dt>
            <dd>{station.company ?? '—'}</dd>
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
            <dt>{d.colOrders}</dt>
            <dd>{station.ordersProcessed}</dd>
          </div>
          {station.associatedOrders && station.associatedOrders.length > 0 && (
            <div className="performance-drawer__row">
              <dt>{d.colAssociatedOrders}</dt>
              <dd>{station.associatedOrders.join(', ')}</dd>
            </div>
          )}
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

type CompanyFilter = 'all' | 'SUMO' | 'MAF'

const COMPANY_SORT_ORDER: Record<'SUMO' | 'MAF', number> = {
  SUMO: 0,
  MAF: 1,
}

function sortRowsByCompany(rows: StationPerformanceRow[]): StationPerformanceRow[] {
  return [...rows].sort((a, b) => {
    const aOrder = a.company ? COMPANY_SORT_ORDER[a.company] ?? 2 : 2
    const bOrder = b.company ? COMPANY_SORT_ORDER[b.company] ?? 2 : 2
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.name.localeCompare(b.name, undefined, { numeric: true })
  })
}

export function PerformanceStationsTable({ rows, onSelect }: PerformanceStationsTableProps) {
  const { t, lang } = useLanguage()
  const d = t.performance
  const [companyFilter, setCompanyFilter] = useState<CompanyFilter>('all')

  const visibleRows = useMemo(() => {
    if (companyFilter === 'all') return sortRowsByCompany(rows)
    return sortRowsByCompany(rows.filter((row) => row.company === companyFilter))
  }, [rows, companyFilter])

  const companyOptions: { id: CompanyFilter; label: string }[] = [
    { id: 'all', label: d.filterCompanyAll },
    { id: 'SUMO', label: 'SUMO' },
    { id: 'MAF', label: 'MAF' },
  ]

  const columnCount = 8

  return (
    <section className="performance-stations dash-card">
      <div className="performance-stations__head">
        <h2 className="performance-stations__title">{d.stationsTitle}</h2>
        <div
          className="performance-stations__filters"
          role="group"
          aria-label={d.filterCompanyLabel}
        >
          {companyOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`performance-stations__chip performance-stations__chip--${opt.id.toLowerCase()}${companyFilter === opt.id ? ' performance-stations__chip--active' : ''}`}
              onClick={() => setCompanyFilter(opt.id)}
              aria-pressed={companyFilter === opt.id}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="performance-stations__table">
          <thead>
            <tr>
              <th>{d.colStation}</th>
              <th>{d.colType}</th>
              <th>{d.colCompany}</th>
              <th>{d.colStatus}</th>
              <th>{d.colEfficiency}</th>
              <th>{d.capacityUsed}</th>
              <th>{d.colEvents}</th>
              <th>{d.colAction}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => {
              const typeName = typeLabel(row.type, d)
              const showGroupHeader =
                companyFilter === 'all' &&
                row.company != null &&
                (index === 0 || visibleRows[index - 1]?.company !== row.company)
              const capacityLabel = `${fmtRate(row.currentBoxesPerHour, lang)} / ${fmtRate(row.maxBoxesPerHour, lang)} ${d.boxesPerHourShort}`

              return (
                <Fragment key={row.id}>
                  {showGroupHeader && (
                    <tr className="performance-stations__group-row">
                      <td colSpan={columnCount}>
                        <CompanyPill company={row.company} />
                      </td>
                    </tr>
                  )}
                  <tr
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
                      <span className={`performance-status-badge performance-status-badge--${row.status}`}>
                        {statusLabel(row.status, d)}
                      </span>
                    </td>
                    <td>
                      <div className="performance-mini-bar performance-mini-bar--efficiency">
                        <div className="performance-mini-bar__track">
                          <span
                            className="performance-mini-bar__fill performance-mini-bar__fill--efficiency"
                            style={{ width: `${row.efficiency}%` }}
                          />
                        </div>
                        <span className="performance-mini-bar__label performance-mini-bar__label--primary">
                          {row.efficiency}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="performance-stations__capacity">{capacityLabel}</span>
                    </td>
                    <td>
                      {row.events > 0 ? (
                        <span className="performance-events-badge">{row.events}</span>
                      ) : (
                        <span className="performance-stations__no-events">{d.noEvents}</span>
                      )}
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
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
