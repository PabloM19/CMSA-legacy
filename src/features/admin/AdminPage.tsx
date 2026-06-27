import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { AdminTabId } from '../../types/admin'
import { canAccessAdmin } from '../../utils/adminStorage'
import { AdminAccessDenied } from './components/AdminAccessDenied'
import { AuditTab } from './components/AuditTab'
import { CompaniesTab } from './components/CompaniesTab'
import { ConfigTab } from './components/ConfigTab'
import { PalletizersTab } from './components/PalletizersTab'
import { TablesTab } from './components/TablesTab'
import { UsersTab } from './components/UsersTab'
import './admin.css'
import '../orders/newOrder.css'

const TABS: AdminTabId[] = ['users', 'companies', 'tables', 'palletizers', 'config', 'audit']

export function AdminPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.admin

  const [activeTab, setActiveTab] = useState<AdminTabId>('users')
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
        extra={
          <p className="admin-page__notice">
            <span className="admin-badge admin-badge--master">{d.masterOnly}</span>{' '}
            {d.phaseNotice}
          </p>
        }
      />

      <nav className="admin-tabs" aria-label={d.title}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`admin-tabs__btn${activeTab === tab ? ' admin-tabs__btn--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {d.tabs[tab]}
          </button>
        ))}
      </nav>

      {activeTab === 'users' && <UsersTab refreshKey={refreshKey} onChanged={bumpRefresh} />}
      {activeTab === 'companies' && <CompaniesTab refreshKey={refreshKey} onChanged={bumpRefresh} />}
      {activeTab === 'tables' && <TablesTab refreshKey={refreshKey} onChanged={bumpRefresh} />}
      {activeTab === 'palletizers' && <PalletizersTab refreshKey={refreshKey} onChanged={bumpRefresh} />}
      {activeTab === 'config' && <ConfigTab refreshKey={refreshKey} onChanged={bumpRefresh} />}
      {activeTab === 'audit' && <AuditTab refreshKey={refreshKey} />}
    </div>
  )
}
