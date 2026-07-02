import { useState } from 'react'
import { Bell } from 'lucide-react'
import { getCellAlarms, markAlarmReviewed } from '../../../data/mockCellAlarms'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { CellAlarm } from '../../../types/cellAlarm'
import { logAlarmReviewed } from '../../../utils/activityLogActions'
import { isSupervisor } from '../../../utils/permissions'
import { OperationalAlarmsTable } from '../../alarms/components/OperationalAlarmsTable'

export function AlarmsTab() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.admin
  const a = t.alarms

  const [alarms, setAlarms] = useState<CellAlarm[]>(() => getCellAlarms())

  function handleMarkReviewed(alarm: CellAlarm) {
    if (!user || !isSupervisor(user)) return
    setAlarms(markAlarmReviewed(alarm.id))
    logAlarmReviewed(user, alarm.id)
  }

  return (
    <section className="admin-section dash-card admin-tab">
      <div className="admin-section__intro">
        <div className="admin-section__icon" aria-hidden="true">
          <Bell size={32} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="admin-section__title">{d.tabs.alarms}</h2>
          <p className="admin-section__desc">{a.subtitle}</p>
        </div>
      </div>

      <OperationalAlarmsTable alarms={alarms} onMarkReviewed={handleMarkReviewed} />

      <p className="alarms-page__v2">{a.reassignmentPendingNote}</p>
    </section>
  )
}
