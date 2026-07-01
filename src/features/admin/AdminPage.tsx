import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { AdminTabId } from '../../types/admin'
import { canAccessAdmin } from '../../utils/adminStorage'
import { getAdminTabsForUser, isSuperAdmin } from '../../utils/permissions'
import { AdminAccessDenied } from './components/AdminAccessDenied'
import { ActivityTab } from './components/ActivityTab'
import { AlarmsTab } from './components/AlarmsTab'
import { CompaniesTab } from './components/CompaniesTab'
import { DemoModePanel } from './components/DemoModePanel'
import { PalletizersTab } from './components/PalletizersTab'
import { ReferencesTab } from './components/ReferencesTab'
import { TablesTab } from './components/TablesTab'
import { UsersTab } from './components/UsersTab'
import './admin.css'
import '../orders/newOrder.css'

export function AdminPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.admin

  const tabs = useMemo(() => (user ? getAdminTabsForUser(user) : []), [user])
  const [activeTab, setActiveTab] = useState<AdminTabId>(() => tabs[0] ?? 'references')
  const [refreshKey, setRefreshKey] = useState(0)

  if (!user || !canAccessAdmin(user)) {
    return <AdminAccessDenied />
  }

  function bumpRefresh() {
    setRefreshKey((k) => k + 1)
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
              if (tab === 'activity') bumpRefresh()
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
        <ReferencesTab refreshKey={refreshKey} />
      )}
      {activeTab === 'tables' && isSuperAdmin(user) && (
        <TablesTab refreshKey={refreshKey} onChanged={bumpRefresh} />
      )}
      {activeTab === 'palletizers' && isSuperAdmin(user) && (
        <PalletizersTab refreshKey={refreshKey} onChanged={bumpRefresh} />
      )}
      {activeTab === 'alarms' && <AlarmsTab />}
      {activeTab === 'activity' && isSuperAdmin(user) && (
        <ActivityTab refreshKey={refreshKey} />
      )}

      {isSuperAdmin(user) && <DemoModePanel onChanged={bumpRefresh} />}
    </div>
  )
}
