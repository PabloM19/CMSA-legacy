import { mockDashboard } from '../../data/mockDashboard'
import { ActiveProductionPanel } from './components/ActiveProductionPanel'
import { AlertsPanel } from './components/AlertsPanel'
import { DashboardStatusBar } from './components/DashboardStatusBar'
import { KpiCards } from './components/KpiCards'
import { OrdersTable } from './components/OrdersTable'
import { PlantPictogram } from './components/PlantPictogram'
import './dashboard.css'

export function DashboardPage() {
  const data = mockDashboard

  return (
    <div className="dashboard">
      <DashboardStatusBar generalStatus={data.generalStatus} />
      <KpiCards kpis={data.kpis} />
      <div className="dashboard__grid">
        <div className="dashboard__main">
          <OrdersTable orders={data.todayOrders} />
          <ActiveProductionPanel items={data.activeProduction} />
        </div>
        <aside className="dashboard__aside">
          <AlertsPanel alerts={data.alerts} />
          <PlantPictogram tables={data.tables} palletizers={data.palletizers} />
        </aside>
      </div>
    </div>
  )
}
