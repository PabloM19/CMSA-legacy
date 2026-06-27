import { mockDashboard } from '../../data/mockDashboard'
import {
  buildAttentionItems,
  computeCompanyCapacity,
  computeOperationalCounts,
  computePlantSummary,
  getRelevantOrders,
} from '../../utils/dashboardHelpers'
import { ActiveProductionCards } from './components/ActiveProductionCards'
import { AttentionPanel } from './components/AttentionPanel'
import { CompanyCapacityCards } from './components/CompanyCapacityCards'
import { DashboardHero } from './components/DashboardHero'
import { MiniPlantSummary } from './components/MiniPlantSummary'
import { OperationalSummary } from './components/OperationalSummary'
import { QuickActionsGrid } from './components/QuickActionsGrid'
import { RelevantOrdersCards } from './components/RelevantOrdersCards'
import './dashboard.css'

export function DashboardPage() {
  const data = mockDashboard
  const operationalCounts = computeOperationalCounts(data)
  const attentionItems = buildAttentionItems(data)
  const companyCapacity = computeCompanyCapacity(data)
  const plantSummary = computePlantSummary(data)
  const relevantOrders = getRelevantOrders(data.todayOrders)

  return (
    <div className="dashboard">
      <DashboardHero data={data} />
      <QuickActionsGrid />

      <div className="dashboard__body">
        <div className="dashboard__primary">
          <AttentionPanel items={attentionItems} />
          <ActiveProductionCards items={data.activeProduction} orders={data.todayOrders} />
          <RelevantOrdersCards orders={relevantOrders} />
        </div>

        <aside className="dashboard__secondary">
          <OperationalSummary counts={operationalCounts} />
          <CompanyCapacityCards companies={companyCapacity} />
          <MiniPlantSummary summary={plantSummary} />
        </aside>
      </div>
    </div>
  )
}
