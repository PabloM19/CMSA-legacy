import { useMemo, useState } from 'react'
import { Eye, Factory, Minus, Package, TrendingDown, TrendingUp, UserRound } from 'lucide-react'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import type { OrderCompany } from '../../../types/newOrder'
import type { PlantElementView, PlantSpeedStatus } from '../../../types/plant'
import {
  mapPlantMapProductionRows,
  type PlantMapProductionRow,
  type PlantMapProductionStation,
} from '../../../utils/plantMapActiveProductionHelpers'
import { RobotArmIcon } from './RobotArmIcon'
import '../../admin/admin.css'
import '../../alarms/alarms.css'
import '../plant-map.css'

const ICON_SIZE = 14

type CompanyFilter = 'all' | OrderCompany

function resolveCompanyFilterOptions(
  userCompany: string | undefined,
  labels: { all: string },
): { id: CompanyFilter; label: string }[] {
  if (!userCompany) return []

  if (userCompany === 'SUMO' || userCompany === 'MAF') {
    return [
      { id: 'all', label: labels.all },
      { id: userCompany, label: userCompany },
    ]
  }

  return [
    { id: 'all', label: labels.all },
    { id: 'SUMO', label: 'SUMO' },
    { id: 'MAF', label: 'MAF' },
  ]
}

interface PlantMapActiveOrdersProps {
  elements: Map<string, PlantElementView>
  orders: BacklogOrder[]
  onViewElement: (element: PlantElementView) => void
}

function StationTypeIcon({ type }: { type: PlantElementView['type'] }) {
  if (type === 'automatic') {
    return <RobotArmIcon size={ICON_SIZE} aria-hidden="true" />
  }
  if (type === 'palletizer') {
    return <Package size={ICON_SIZE} aria-hidden="true" />
  }
  return <UserRound size={ICON_SIZE} aria-hidden="true" />
}

function StationList({ stations }: { stations: PlantMapProductionStation[] }) {
  return (
    <span className="plant-map-production-table__stations">
      {stations.map((station, index) => (
        <span key={station.id} className="plant-map-production-table__station">
          {index > 0 ? <span className="plant-map-production-table__station-sep">, </span> : null}
          <span className="plant-map-production-table__station-icon" aria-hidden="true">
            <StationTypeIcon type={station.type} />
          </span>
          {station.code}
        </span>
      ))}
    </span>
  )
}

function PaceIcon({ speed }: { speed: PlantSpeedStatus }) {
  if (speed === 'slow') {
    return <TrendingDown size={ICON_SIZE} aria-hidden="true" className="plant-map-production-table__pace-icon plant-map-production-table__pace-icon--slow" />
  }
  if (speed === 'fast') {
    return <TrendingUp size={ICON_SIZE} aria-hidden="true" className="plant-map-production-table__pace-icon plant-map-production-table__pace-icon--fast" />
  }
  return <Minus size={ICON_SIZE} aria-hidden="true" className="plant-map-production-table__pace-icon plant-map-production-table__pace-icon--normal" />
}

function ProgressCell({ percent }: { percent: number }) {
  return (
    <div className="plant-map-production-table__progress">
      <div className="plant-map-production-table__progress-bar">
        <span
          className="plant-map-production-table__progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <span className="plant-map-production-table__progress-label">{percent}%</span>
    </div>
  )
}

function ProductionRow({
  row,
  elementMap,
  labels,
  onViewElement,
}: {
  row: PlantMapProductionRow
  elementMap: Map<string, PlantElementView>
  labels: {
    viewDetail: string
    paceNormal: string
    paceSlow: string
    paceFast: string
  }
  onViewElement: (element: PlantElementView) => void
}) {
  const companyClass = row.company?.toLowerCase() ?? 'neutral'
  const paceTitle =
    row.speedStatus === 'slow'
      ? labels.paceSlow
      : row.speedStatus === 'fast'
        ? labels.paceFast
        : labels.paceNormal

  function handleViewDetail() {
    const element = elementMap.get(row.focusElementId)
    if (element) onViewElement(element)
  }

  return (
    <tr className={`plant-map-production-table__row plant-map-production-table__row--${companyClass}`}>
      <td className="admin-table__cell-mono">{row.orderNumber}</td>
      <td className="admin-table__cell-mono">{row.reference}</td>
      <td>
        {row.company ? (
          <span className={`admin-badge admin-badge--${row.company.toLowerCase()}`}>{row.company}</span>
        ) : (
          '—'
        )}
      </td>
      <td>
        <StationList stations={row.stations} />
      </td>
      <td>{row.typeLabel}</td>
      <td>
        <span className={`plant-map-production-table__status plant-map-production-table__status--${row.statusTone}`}>
          {row.statusLabel}
        </span>
      </td>
      <td>
        <ProgressCell percent={row.progressPercent} />
      </td>
      <td>
        <span className="plant-map-production-table__pace" title={paceTitle} aria-label={paceTitle}>
          <PaceIcon speed={row.speedStatus} />
        </span>
      </td>
      <td className="admin-table__cell-mono">{row.etc ?? '—'}</td>
      <td className="admin-table__actions">
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={handleViewDetail}>
          <Eye size={14} aria-hidden="true" />
          {labels.viewDetail}
        </button>
      </td>
    </tr>
  )
}

export function PlantMapActiveOrders({ elements, orders, onViewElement }: PlantMapActiveOrdersProps) {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.plantMap
  const [companyFilter, setCompanyFilter] = useState<CompanyFilter>('all')

  const rows = useMemo(
    () => mapPlantMapProductionRows(elements, orders, lang),
    [elements, orders, lang],
  )

  const companyOptions = useMemo(
    () =>
      resolveCompanyFilterOptions(user?.company, {
        all: d.currentProductionFilterAll,
      }),
    [user?.company, d.currentProductionFilterAll],
  )

  const filteredRows = useMemo(() => {
    if (companyFilter === 'all') return rows
    return rows.filter((row) => row.company === companyFilter)
  }, [rows, companyFilter])

  const labels = {
    viewDetail: d.currentProductionViewDetail,
    paceNormal: d.currentProductionPaceNormal,
    paceSlow: d.legendIconSlow,
    paceFast: d.legendIconFast,
  }

  const emptyTitle =
    rows.length > 0 && filteredRows.length === 0
      ? d.currentProductionEmptyFiltered
      : d.currentProductionEmpty

  return (
    <section
      className="plant-map-production-panel operational-data-panel"
      aria-labelledby="plant-map-current-production-title"
    >
      <header className="plant-map-production-panel__head">
        <div className="plant-map-production-panel__head-text">
          <h2 id="plant-map-current-production-title" className="operational-data-panel__title">
            {d.currentProductionTitle}
          </h2>
          <p className="plant-map-production-panel__subtitle">{d.currentProductionSubtitle}</p>
        </div>

        {companyOptions.length > 0 && (
          <div
            className="admin-filter-bar plant-map-production-panel__filters"
            role="group"
            aria-label={d.currentProductionFilterLabel}
          >
            {companyOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`admin-filter-bar__btn plant-map-production-panel__filter-btn${companyFilter === opt.id ? ' admin-filter-bar__btn--active' : ''}${opt.id !== 'all' ? ` plant-map-production-panel__filter-btn--${opt.id.toLowerCase()}` : ''}`}
                onClick={() => setCompanyFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {filteredRows.length === 0 ? (
        <EmptyState
          icon={<Factory size={26} strokeWidth={1.5} />}
          title={emptyTitle}
        />
      ) : (
        <div className="admin-table-wrap plant-map-production-table-wrap" role="region" aria-label={d.currentProductionTitle}>
          <table className="admin-table plant-map-production-table">
            <thead>
              <tr>
                <th>{d.currentProductionColOrder}</th>
                <th>{d.currentProductionColReference}</th>
                <th>{d.currentProductionColCompany}</th>
                <th>{d.currentProductionColStation}</th>
                <th>{d.currentProductionColType}</th>
                <th>{d.currentProductionColStatus}</th>
                <th>{d.currentProductionColProgress}</th>
                <th>{d.currentProductionColPace}</th>
                <th>{d.currentProductionColEtc}</th>
                <th>{d.currentProductionColAction}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <ProductionRow
                  key={row.id}
                  row={row}
                  elementMap={elements}
                  labels={labels}
                  onViewElement={onViewElement}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
