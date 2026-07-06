import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { getCellAlarms, markAlarmReviewed } from '../../data/mockCellAlarms'
import { getRealSafetyAlarms, type RealSafetyAlarm } from '../../data/mockSafetyAlarms'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { CellAlarm } from '../../types/cellAlarm'
import { logAlarmReviewed } from '../../utils/activityLogActions'
import { isSupervisor } from '../../utils/permissions'
import { OperationalAlarmsTable } from './components/OperationalAlarmsTable'
import { RealSafetyAlarmsTable } from './components/RealSafetyAlarmsTable'
import '../admin/admin.css'
import './alarms.css'

type EventsTab = 'operational' | 'safety'

export function AlarmsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.alarms

  const [tab, setTab] = useState<EventsTab>('operational')
  const [alarms, setAlarms] = useState<CellAlarm[]>(() => getCellAlarms())
  const [safetyAlarms, setSafetyAlarms] = useState<RealSafetyAlarm[]>(() => getRealSafetyAlarms())

  function handleMarkReviewed(alarm: CellAlarm) {
    if (!user || !isSupervisor(user)) return
    setAlarms(markAlarmReviewed(alarm.id))
    logAlarmReviewed(user, alarm.id)
  }

  function handleMarkSafetyReviewed(alarm: RealSafetyAlarm) {
    if (!user || !isSupervisor(user)) return
    setSafetyAlarms((prev) =>
      prev.map((a) => (a.id === alarm.id && a.status === 'active' ? { ...a, status: 'reviewed' } : a)),
    )
  }

  return (
    <div className="alarms-page">
      <PageHeader title={d.title} description={d.subtitle} showMockBadge badgeLabel={d.mockBadge} />

      <section className="operational-data-panel alarms-page__table">
        <div className="alarms-page__tabs admin-filter-bar" role="tablist" aria-label={d.title}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'operational'}
            className={`admin-filter-bar__btn${tab === 'operational' ? ' admin-filter-bar__btn--active' : ''}`}
            onClick={() => setTab('operational')}
          >
            {d.tabOperational}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'safety'}
            className={`admin-filter-bar__btn${tab === 'safety' ? ' admin-filter-bar__btn--active' : ''}`}
            onClick={() => setTab('safety')}
          >
            {d.tabSafety}
          </button>
        </div>

        {tab === 'operational' ? (
          <OperationalAlarmsTable alarms={alarms} onMarkReviewed={handleMarkReviewed} />
        ) : (
          <RealSafetyAlarmsTable alarms={safetyAlarms} onMarkReviewed={handleMarkSafetyReviewed} />
        )}
      </section>

      <p className="alarms-page__v2">{d.reassignmentPendingNote}</p>
    </div>
  )
}
