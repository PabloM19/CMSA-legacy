import { getCellAlarms } from '../../../data/mockCellAlarms'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { CellAlarm } from '../../../types/cellAlarm'
import { OperationalAlarmsTable } from '../../alarms/components/OperationalAlarmsTable'
import '../../admin/admin.css'
import '../../alarms/alarms.css'
import '../plant-map.css'

interface PlantMapAlertsProps {
  alarms?: CellAlarm[]
  onSelectAlarm: (alarm: CellAlarm) => void
  onMarkReviewed?: (alarm: CellAlarm) => void
}

export function PlantMapAlerts({ alarms: alarmsProp, onSelectAlarm, onMarkReviewed }: PlantMapAlertsProps) {
  const { t } = useLanguage()
  const d = t.plantMap

  const source = alarmsProp ?? getCellAlarms()

  return (
    <section
      className="plant-map-events-panel operational-data-panel"
      aria-labelledby="plant-map-events-title"
    >
      <OperationalAlarmsTable
        alarms={source}
        onViewDetail={onSelectAlarm}
        onMarkReviewed={onMarkReviewed}
        sectionTitle={d.activeEventsTitle}
        variant="plantMap"
      />
    </section>
  )
}
