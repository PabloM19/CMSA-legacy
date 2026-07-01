import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { AdminTabId } from '../../types/admin'
import type { BacklogOrder } from '../../types/backlog'
import { canAccessAdmin } from '../../utils/adminStorage'
import { getState, saveOrdersAndPlant } from '../../utils/backlogStorage'
import { getAdminTabsForUser, isSuperAdmin } from '../../utils/permissions'
import { logOrderWithdrawn } from '../../utils/activityLogActions'
import { withdrawOrderFromProduction, type WithdrawReason } from '../../utils/withdrawProduction'
import { AdminAccessDenied } from './components/AdminAccessDenied'
import { ActivityTab } from './components/ActivityTab'
import { AlarmsTab } from './components/AlarmsTab'
import { CompaniesTab } from './components/CompaniesTab'
import { DemoModePanel } from './components/DemoModePanel'
import { PalletizersTab } from './components/PalletizersTab'
import { ProductionTab } from './components/ProductionTab'
import { ReferencesTab } from './components/ReferencesTab'
import { TablesTab } from './components/TablesTab'
import { UsersTab } from './components/UsersTab'
import { WithdrawProductionModal } from '../backlog/components/WithdrawProductionModal'
import './admin.css'
import '../orders/newOrder.css'

const REASON_LABELS_ES: Record<WithdrawReason, string> = {
  incident: 'Incidencia operativa',
  reference_error: 'Error de referencia',
  supervisor_decision: 'Decisión de supervisor',
  other: 'Otro',
}

export function AdminPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.admin

  const tabs = useMemo(() => (user ? getAdminTabsForUser(user) : []), [user])
  const [activeTab, setActiveTab] = useState<AdminTabId>(() => tabs[0] ?? 'references')
  const [refreshKey, setRefreshKey] = useState(0)
  const [withdrawOrder, setWithdrawOrder] = useState<BacklogOrder | null>(null)

  if (!user || !canAccessAdmin(user)) {
    return <AdminAccessDenied />
  }

  function bumpRefresh() {
    setRefreshKey((k) => k + 1)
  }

  function handleWithdrawConfirm(reason: WithdrawReason, comment: string) {
    if (!user || !withdrawOrder) return
    const state = getState()
    const reasonLabel = REASON_LABELS_ES[reason]
    const fullReason = comment ? `${reasonLabel} — ${comment}` : reasonLabel
    const result = withdrawOrderFromProduction(
      state.orders,
      state.plantTables,
      withdrawOrder.id,
      fullReason,
      user.name,
    )
    saveOrdersAndPlant(result.orders, result.plantTables)
    logOrderWithdrawn(user, withdrawOrder.reference, fullReason)
    setWithdrawOrder(null)
    bumpRefresh()
  }

  return (
    <div className="admin-page">
      <PageHeader
        title={d.title}
        description={d.subtitle}
        showMockBadge
        badgeLabel={d.mockPhaseBadge}
      />

      <nav className="admin-tabs" aria-label={d.title}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`admin-tabs__btn${activeTab === tab ? ' admin-tabs__btn--active' : ''}`}
            onClick={() => {
              setActiveTab(tab)
              if (tab === 'activity' || tab === 'production') bumpRefresh()
            }}
          >
            {d.tabs[tab]}
          </button>
        ))}
      </nav>

      {activeTab === 'users' && isSuperAdmin(user) && (
        <UsersTab refreshKey={refreshKey} onChanged={bumpRefresh} />
      )}
      {activeTab === 'companies' && isSuperAdmin(user) && (
        <CompaniesTab refreshKey={refreshKey} onChanged={bumpRefresh} />
      )}
      {activeTab === 'references' && (
        <ReferencesTab refreshKey={refreshKey} canManage onChanged={bumpRefresh} />
      )}
      {activeTab === 'tables' && isSuperAdmin(user) && (
        <TablesTab refreshKey={refreshKey} onChanged={bumpRefresh} />
      )}
      {activeTab === 'palletizers' && isSuperAdmin(user) && (
        <PalletizersTab refreshKey={refreshKey} onChanged={bumpRefresh} />
      )}
      {activeTab === 'alarms' && <AlarmsTab />}
      {activeTab === 'production' && (
        <ProductionTab refreshKey={refreshKey} onWithdraw={setWithdrawOrder} />
      )}
      {activeTab === 'activity' && isSuperAdmin(user) && (
        <ActivityTab refreshKey={refreshKey} />
      )}

      {isSuperAdmin(user) && <DemoModePanel onChanged={bumpRefresh} />}

      {withdrawOrder && (
        <WithdrawProductionModal
          order={withdrawOrder}
          onClose={() => setWithdrawOrder(null)}
          onConfirm={handleWithdrawConfirm}
        />
      )}
    </div>
  )
}
