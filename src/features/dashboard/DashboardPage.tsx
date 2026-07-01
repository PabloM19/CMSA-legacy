import { mockDashboard } from '../../data/mockDashboard'
import {
  buildAttentionItems,
  computeCompanyCapacity,
  computeOperationalCounts,
} from '../../utils/dashboardHelpers'
import { ActiveProductionCards } from './components/ActiveProductionCards'
import { AttentionPanel } from './components/AttentionPanel'
import { CompanyCapacityCards } from './components/CompanyCapacityCards'
import { DashboardHero } from './components/DashboardHero'
import { OperationalSummary } from './components/OperationalSummary'
import { QuickActionsGrid } from './components/QuickActionsGrid'
import './dashboard.css'

export function DashboardPage() {
  const data = mockDashboard
  const operationalCounts = computeOperationalCounts(data)
  const attentionItems = buildAttentionItems(data)
  const companyCapacity = computeCompanyCapacity(data)

  return (
    <div className="dashboard">
      <DashboardHero data={data} />
      <QuickActionsGrid />

      <div className="dashboard__body">
        <div className="dashboard__primary">
          <AttentionPanel items={attentionItems} />
          <ActiveProductionCards items={data.activeProduction} orders={data.todayOrders} />
        </div>

        <aside className="dashboard__secondary">
          <OperationalSummary counts={operationalCounts} />
          <CompanyCapacityCards companies={companyCapacity} />
        </aside>
      </div>
    </div>
  )
}
