import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { getCellAlarms, markAlarmReviewed } from '../../data/mockCellAlarms'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { CellAlarm } from '../../types/cellAlarm'
import { logAlarmReviewed } from '../../utils/activityLogActions'
import { isSupervisor } from '../../utils/permissions'
import { OperationalAlarmsTable } from './components/OperationalAlarmsTable'
import '../admin/admin.css'
import './alarms.css'

export function AlarmsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.alarms

  const [alarms, setAlarms] = useState<CellAlarm[]>(() => getCellAlarms())

  function handleMarkReviewed(alarm: CellAlarm) {
    if (!user || !isSupervisor(user)) return
    setAlarms(markAlarmReviewed(alarm.id))
    logAlarmReviewed(user, alarm.id)
  }

  return (
    <div className="alarms-page">
      <PageHeader title={d.title} description={d.subtitle} showMockBadge badgeLabel={d.mockBadge} />

      <section className="operational-data-panel alarms-page__table">
        <OperationalAlarmsTable alarms={alarms} onMarkReviewed={handleMarkReviewed} />
      </section>

      <p className="alarms-page__v2">{d.reassignmentPendingNote}</p>
    </div>
  )
}
