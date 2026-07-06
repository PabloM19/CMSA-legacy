import { useMemo, useState } from 'react'
import { Eye, Rocket, TrendingUp } from 'lucide-react'
import { AdminSearchBar } from '../../admin/components/AdminSearchBar'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DailyOrder } from '../../../types/dailyOrder'
import { isSupervisor } from '../../../utils/permissions'
import { canActOnOrder } from '../../../utils/dashboardPermissions'
import { useAuth } from '../../auth/AuthContext'

interface DailyOrdersTableProps {
  orders: DailyOrder[]
  onLaunch: (order: DailyOrder) => void
  onExpand: (order: DailyOrder) => void
  onViewDetail: (order: DailyOrder) => void
}

type CompanyFilter = 'all' | 'SUMO' | 'MAF'
type StatusFilter = 'all' | 'remaining' | 'completed' | 'overassigned'

function fmt(n: number, lang: 'es' | 'en') {
  return n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')
}

function isOverassigned(order: DailyOrder) {
  return order.cajasAsignadas > order.totalCajasDia
}

function isCompleted(order: DailyOrder) {
  return order.cajasRestantes === 0 && order.cajasCompletadas >= order.totalCajasDia
}

function hasRemaining(order: DailyOrder) {
  return order.cajasRestantes > 0
}

function matchesSearch(order: DailyOrder, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    order.variedad.toLowerCase().includes(q) ||
    order.estilo.toLowerCase().includes(q) ||
    order.referencia.toLowerCase().includes(q) ||
    order.empresa.toLowerCase().includes(q) ||
    order.barcode.toLowerCase().includes(q) ||
    order.estado.toLowerCase().includes(q)
  )
}

function matchesCompany(order: DailyOrder, filter: CompanyFilter) {
  if (filter === 'all') return true
  return order.empresa === filter
}

function matchesStatus(order: DailyOrder, filter: StatusFilter) {
  if (filter === 'all') return true
  if (filter === 'remaining') return hasRemaining(order)
  if (filter === 'completed') return isCompleted(order)
  return isOverassigned(order)
}

export function DailyOrdersTable({ orders, onLaunch, onExpand, onViewDetail }: DailyOrdersTableProps) {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.backlog
  const canExpand = user && isSupervisor(user)

  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState<CompanyFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          matchesSearch(order, search) &&
          matchesCompany(order, companyFilter) &&
          matchesStatus(order, statusFilter),
      ),
    [orders, search, companyFilter, statusFilter],
  )

  const hasActiveFilters =
    search.trim().length > 0 || companyFilter !== 'all' || statusFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setCompanyFilter('all')
    setStatusFilter('all')
  }

  const companyOptions: { id: CompanyFilter; label: string }[] = [
    { id: 'all', label: d.filterAll },
    { id: 'SUMO', label: 'SUMO' },
    { id: 'MAF', label: 'MAF' },
  ]

  const statusOptions: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: d.filterAll },
    { id: 'remaining', label: d.filterRemaining },
    { id: 'completed', label: d.filterCompleted },
    { id: 'overassigned', label: d.filterOverassigned },
  ]

  const resultsLabel = hasActiveFilters
    ? d.filterResultsCount.replace('{count}', String(filteredOrders.length))
    : d.dailyOrdersCount.replace('{count}', String(orders.length))

  return (
    <section className="operational-data-panel daily-orders-panel">
      <h2 className="operational-data-panel__title">{d.dailyOrdersTitle}</h2>

      <div className="operational-data-panel__toolbar">
        <div className="operational-data-panel__toolbar-row">
          <AdminSearchBar
            value={search}
            onChange={setSearch}
            placeholder={d.dailyOrdersSearchPlaceholder}
            resultCount={filteredOrders.length}
          />
          <span className="operational-data-panel__results">{resultsLabel}</span>
          {hasActiveFilters && (
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm operational-data-panel__clear"
              onClick={clearFilters}
            >
              {d.clearFilters}
            </button>
          )}
        </div>

        <div className="operational-data-panel__filters">
          <div className="admin-filter-bar" role="group" aria-label={d.filterCompanyLabel}>
            {companyOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`admin-filter-bar__btn${companyFilter === opt.id ? ' admin-filter-bar__btn--active' : ''}`}
                onClick={() => setCompanyFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div
            className="admin-filter-bar admin-filter-bar--status"
            role="group"
            aria-label={d.filterStatusLabel}
          >
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`admin-filter-bar__btn${statusFilter === opt.id ? ' admin-filter-bar__btn--active' : ''}`}
                onClick={() => setStatusFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-table-wrap" role="region" aria-label={d.dailyOrdersTitle}>
        <table className="admin-table daily-orders-table">
          <thead>
            <tr>
              <th>{d.colVariety}</th>
              <th>{d.reference}</th>
              <th>{d.company}</th>
              <th>{d.colTotalDay}</th>
              <th>{d.colAssigned}</th>
              <th>{d.colCompleted}</th>
              <th>{d.colRemaining}</th>
              <th>{d.colProgress}</th>
              <th>{d.colAction}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="admin-table__empty">
                  {d.noDailyOrdersFound}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const overassigned = isOverassigned(order)
                return (
                  <tr
                    key={order.id}
                    className={`daily-orders-table__row daily-orders-table__row--${order.empresa.toLowerCase()}${overassigned ? ' daily-orders-table__row--overassigned' : ''}`}
                  >
                    <td className="daily-orders-table__variety">{order.variedad}</td>
                    <td className="admin-table__cell-mono">{order.referencia}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${order.empresa.toLowerCase()}`}>
                        {order.empresa}
                      </span>
                    </td>
                    <td>{fmt(order.totalCajasDia, lang)}</td>
                    <td>{fmt(order.cajasAsignadas, lang)}</td>
                    <td>{fmt(order.cajasCompletadas, lang)}</td>
                    <td>{fmt(order.cajasRestantes, lang)}</td>
                    <td>
                      <div className="daily-orders-table__progress">
                        {overassigned && (
                          <span className="daily-orders-table__over-badge">{d.overassignedBadge}</span>
                        )}
                        <div className="daily-orders-table__progress-bar">
                          <span
                            className="daily-orders-table__progress-fill daily-orders-table__progress-fill--assigned"
                            style={{ width: `${Math.min(100, order.porcentajeAsignado)}%` }}
                          />
                          <span
                            className="daily-orders-table__progress-fill daily-orders-table__progress-fill--done"
                            style={{ width: `${Math.min(100, order.porcentajeCompletado)}%` }}
                          />
                        </div>
                        <span className="daily-orders-table__progress-label">
                          {order.porcentajeAsignado}% / {order.porcentajeCompletado}%
                        </span>
                      </div>
                    </td>
                    <td className="admin-table__actions">
                      {user && canActOnOrder(user, order.empresa) && (
                        <button
                          type="button"
                          className="admin-btn admin-btn--primary admin-btn--sm"
                          onClick={() => onLaunch(order)}
                        >
                          <Rocket size={14} aria-hidden="true" />
                          {d.launchOrder}
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => onViewDetail(order)}
                      >
                        <Eye size={14} aria-hidden="true" />
                        {d.viewDetail}
                      </button>
                      {canExpand && (
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          onClick={() => onExpand(order)}
                        >
                          <TrendingUp size={14} aria-hidden="true" />
                          {d.expandDailyOrder}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
