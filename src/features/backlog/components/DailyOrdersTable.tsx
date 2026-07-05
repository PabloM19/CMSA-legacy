import { Eye, Rocket, TrendingUp } from 'lucide-react'
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

function fmt(n: number, lang: 'es' | 'en') {
  return n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')
}

export function DailyOrdersTable({ orders, onLaunch, onExpand, onViewDetail }: DailyOrdersTableProps) {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.backlog
  const canExpand = user && isSupervisor(user)

  return (
    <section className="daily-orders-table dash-card">
      <h2 className="daily-orders-table__title">{d.dailyOrdersTitle}</h2>
      <div className="daily-orders-table__wrap">
        <table className="daily-orders-table__table">
          <thead>
            <tr>
              <th>{d.colStyle}</th>
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
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="daily-orders-table__style">{order.estilo}</td>
                <td className="daily-orders-table__mono">{order.referencia}</td>
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
                <td className="daily-orders-table__actions">
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
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
