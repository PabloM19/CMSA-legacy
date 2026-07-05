import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Map, Plus, RefreshCw, Factory } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { computeDailySummaryFromState } from '../../data/mockBacklogOrders'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { DailyOrder } from '../../types/dailyOrder'
import type { BacklogOrder } from '../../types/backlog'
import type { PlantTable } from '../../types/plant'
import { getState, saveOrdersAndPlant } from '../../utils/backlogStorage'
import { canActOnOrder } from '../../utils/dashboardPermissions'
import { canAccessRoute } from '../../utils/permissions'
import { DailyOrdersSummary } from './components/DailyOrdersSummary'
import { DailyOrdersTable } from './components/DailyOrdersTable'
import { ExpandDailyOrderModal } from './components/ExpandDailyOrderModal'
import { LaunchProductionOrderModal } from './components/LaunchProductionOrderModal'
import { CreateDailyOrderModal } from './components/CreateDailyOrderModal'
import { DailyOrderDetailModal } from './components/DailyOrderDetailModal'
import { BacklogToast } from './components/BacklogToast'
import '../dashboard/dashboard.css'
import './backlog.css'
import '../admin/admin.css'

export function DailyOrdersPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.dailyOrdersPage
  const b = t.backlog

  const [dailyOrders, setDailyOrders] = useState<DailyOrder[]>(() => getState().dailyOrders)
  const [orders, setOrders] = useState<BacklogOrder[]>(() => getState().orders)
  const [plantTables, setPlantTables] = useState<PlantTable[]>(() => getState().plantTables)
  const [launchDaily, setLaunchDaily] = useState<DailyOrder | null>(null)
  const [expandDaily, setExpandDaily] = useState<DailyOrder | null>(null)
  const [detailDaily, setDetailDaily] = useState<DailyOrder | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'info'
  } | null>(null)

  const persist = useCallback(
    (nextOrders: BacklogOrder[], nextPlant: PlantTable[], nextDaily?: DailyOrder[]) => {
      setOrders(nextOrders)
      setPlantTables(nextPlant)
      if (nextDaily) setDailyOrders(nextDaily)
      saveOrdersAndPlant(nextOrders, nextPlant, nextDaily)
    },
    [],
  )

  const showToast = useCallback(
    (message: string, type: 'error' | 'success' | 'info' = 'info') => {
      setToast({ message, type })
    },
    [],
  )

  function handleRefresh() {
    const state = getState()
    setDailyOrders(state.dailyOrders)
    persist(state.orders, state.plantTables, state.dailyOrders)
    showToast(b.refreshed, 'info')
  }

  function handleLaunch(order: DailyOrder) {
    if (!user || !canActOnOrder(user, order.empresa)) {
      showToast(b.noPermission, 'error')
      return
    }
    setLaunchDaily(order)
  }

  const summary = computeDailySummaryFromState(dailyOrders, orders)

  return (
    <div className="backlog-page">
      <PageHeader
        title={d.title}
        description={d.subtitle}
        showMockBadge
        badgeLabel={b.simulatedBadge}
      />

      <DailyOrdersSummary stats={summary} />

      {user && (
        <section className="dash-quick">
          <h2 className="dash-quick__title">{b.quickActionsTitle}</h2>
          <div className="dash-quick__grid">
            <button type="button" className="dash-quick__btn" onClick={() => setShowCreate(true)}>
              <span className="dash-quick__btn-icon">
                <Plus size={24} strokeWidth={1.75} />
              </span>
              <span className="dash-quick__btn-label">{d.newDailyOrder}</span>
              <span className="dash-quick__btn-hint">{d.newDailyOrderHint}</span>
            </button>
            {canAccessRoute(user, '/production-orders') && (
              <Link to="/production-orders" className="dash-quick__btn">
                <span className="dash-quick__btn-icon">
                  <Factory size={24} strokeWidth={1.75} />
                </span>
                <span className="dash-quick__btn-label">{d.goProductionOrders}</span>
                <span className="dash-quick__btn-hint">{d.goProductionOrdersHint}</span>
              </Link>
            )}
            {canAccessRoute(user, '/plant-map') && (
              <Link to="/plant-map" className="dash-quick__btn">
                <span className="dash-quick__btn-icon">
                  <Map size={24} strokeWidth={1.75} />
                </span>
                <span className="dash-quick__btn-label">{b.actionPlant}</span>
                <span className="dash-quick__btn-hint">{b.actionPlantHint}</span>
              </Link>
            )}
            <button type="button" className="dash-quick__btn" onClick={handleRefresh}>
              <span className="dash-quick__btn-icon">
                <RefreshCw size={24} strokeWidth={1.75} />
              </span>
              <span className="dash-quick__btn-label">{b.actionRefresh}</span>
              <span className="dash-quick__btn-hint">{b.actionRefreshHint}</span>
            </button>
          </div>
        </section>
      )}

      <DailyOrdersTable
        orders={dailyOrders}
        onLaunch={handleLaunch}
        onExpand={setExpandDaily}
        onViewDetail={setDetailDaily}
      />

      <BacklogToast
        message={toast?.message ?? null}
        type={toast?.type}
        onClear={() => setToast(null)}
      />

      {launchDaily && user && (
        <LaunchProductionOrderModal
          dailyOrders={dailyOrders}
          daily={launchDaily}
          productionOrders={orders}
          user={user}
          onClose={() => setLaunchDaily(null)}
          onLaunched={(nextDaily, nextOrders) => {
            persist(nextOrders, plantTables, nextDaily)
            showToast(b.launchSuccess, 'success')
          }}
        />
      )}

      {expandDaily && user && (
        <ExpandDailyOrderModal
          dailyOrders={dailyOrders}
          daily={expandDaily}
          user={user}
          onClose={() => setExpandDaily(null)}
          onExpanded={(nextDaily) => {
            persist(orders, plantTables, nextDaily)
            showToast(b.expandSuccess, 'success')
          }}
        />
      )}

      {showCreate && user && (
        <CreateDailyOrderModal
          user={user}
          dailyOrders={dailyOrders}
          onClose={() => setShowCreate(false)}
          onCreated={(nextDaily) => {
            persist(orders, plantTables, nextDaily)
            showToast(d.createSuccess, 'success')
          }}
        />
      )}

      {detailDaily && (
        <DailyOrderDetailModal daily={detailDaily} onClose={() => setDetailDaily(null)} />
      )}
    </div>
  )
}
