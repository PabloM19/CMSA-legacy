import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { ReferencesTab } from '../admin/components/ReferencesTab'
import { isSupervisor } from '../../utils/permissions'
import { Navigate } from 'react-router-dom'
import '../admin/admin.css'

export function ReferencesPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.references

  const [refreshKey, setRefreshKey] = useState(0)

  if (!user || !isSupervisor(user)) {
    return <Navigate to="/plant-map" replace />
  }

  return (
    <div className="admin-page references-page">
      <PageHeader
        title={d.title}
        description={d.subtitle}
        showMockBadge
        badgeLabel={t.backlog.simulatedBadge}
      />
      <ReferencesTab
        refreshKey={refreshKey}
        canManage
        onChanged={() => setRefreshKey((k) => k + 1)}
        showHeader={false}
      />
    </div>
  )
}
