import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../../../features/auth/AuthContext'
import { CompanyBadge, StatusBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DashboardOrder } from '../../../types/dashboard'
import {
  canActOnOrder,
  getActionDisabledReason,
} from '../../../utils/dashboardPermissions'
import { getDashboardOrderStatusBadge } from '../../../utils/statusBadge'

interface OrdersTableProps {
  orders: DashboardOrder[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.dashboard

  if (!user) return null

  return (
    <section className="dash-card dash-orders">
      <h2 className="dash-section-title">{d.todayOrders}</h2>
      <div className="dash-orders__scroll">
        <table className="dash-table">
          <thead>
            <tr>
              <th>{d.colStatus}</th>
              <th>{d.colCompany}</th>
              <th>{d.colReference}</th>
              <th>{d.colProduct}</th>
              <th>{d.colVariety}</th>
              <th>{d.colBoxes}</th>
              <th>{d.colRate}</th>
              <th>{d.colEta}</th>
              <th>{d.colEnd}</th>
              <th>{d.colTables}</th>
              <th>{d.colAlerts}</th>
              <th>{d.colAction}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const allowed = canActOnOrder(user, order.company)
              const disabledReason = getActionDisabledReason(user, order.company, lang)
              const statusBadge = getDashboardOrderStatusBadge(order.status, lang)

              return (
                <tr key={order.id}>
                  <td>
                    <StatusBadge label={statusBadge.label} variant={statusBadge.variant} />
                  </td>
                  <td>
                    <CompanyBadge company={order.company} />
                  </td>
                  <td className="dash-table__mono">{order.reference}</td>
                  <td>{order.product}</td>
                  <td>{order.variety}</td>
                  <td className="dash-table__num">{order.boxes}</td>
                  <td className="dash-table__num">{order.boxesPerHour}</td>
                  <td>{order.eta}</td>
                  <td>{order.estimatedEnd}</td>
                  <td>
                    {order.assignedTables.length > 0
                      ? order.assignedTables.join(', ')
                      : d.noAlerts}
                  </td>
                  <td>
                    {order.alerts.length > 0 ? (
                      <span className="dash-table__alerts">
                        <AlertTriangle size={13} aria-hidden="true" />
                        {order.alerts.join(' · ')}
                      </span>
                    ) : (
                      d.noAlerts
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="dash-btn dash-btn--sm"
                      disabled={!allowed}
                      title={disabledReason ?? undefined}
                    >
                      {allowed ? d.actionManage : d.actionView}
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
