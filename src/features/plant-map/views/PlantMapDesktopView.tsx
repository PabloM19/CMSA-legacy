import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { getCellAlarms, markAlarmReviewed } from '../../../data/mockCellAlarms'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { CellAlarm } from '../../../types/cellAlarm'
import { getState } from '../../../utils/backlogStorage'
import { buildPlantElementMap } from '../../../utils/plantMapHelpers'
import { computePlantMapSummaryStats } from '../../../utils/plantMapSummaryHelpers'
import { PlantAlarmDrawer } from '../components/PlantAlarmDrawer'
import { PlantElementDrawer } from '../components/PlantElementDrawer'
import { PlantLayout } from '../components/PlantLayout'
import { PlantLegend } from '../components/PlantLegend'
import { PlantMapAlerts } from '../components/PlantMapAlerts'
import { PlantMapQuickActions } from '../components/PlantMapQuickActions'
import { PlantMapSummary } from '../components/PlantMapSummary'
import type { PlantElementView } from '../../../types/plant'
import '../plant-map.css'

/** Vista escritorio — se activa por ancho (≥1100px) dentro de /plant-map */
export function PlantMapDesktopView() {
  const { user, isAuthenticated } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.plantMap

  const [state, setState] = useState(() => getState())
  const [alarms, setAlarms] = useState<CellAlarm[]>(() => getCellAlarms())
  const [selected, setSelected] = useState<PlantElementView | null>(null)
  const [selectedAlarm, setSelectedAlarm] = useState<CellAlarm | null>(null)

  useEffect(() => {
    setState(getState())
    setAlarms(getCellAlarms())
    setSelected(null)
    setSelectedAlarm(null)
  }, [])

  const elements = useMemo(
    () =>
      buildPlantElementMap(
        state.plantTables,
        state.plantPalletizers,
        state.orders,
        lang,
      ),
    [state, lang],
  )

  const summaryStats = useMemo(
    () => computePlantMapSummaryStats(elements, state.orders),
    [elements, state.orders],
  )

  function handleMarkReviewed(alarm: CellAlarm) {
    const next = markAlarmReviewed(alarm.id)
    setAlarms(next)
    if (selectedAlarm?.id === alarm.id) {
      setSelectedAlarm(next.find((item) => item.id === alarm.id) ?? null)
    }
  }

  function handleSelectAlarm(alarm: CellAlarm) {
    setSelectedAlarm(alarm)
    setSelected(null)
  }

  function handleSelectElement(element: PlantElementView) {
    setSelected(element)
    setSelectedAlarm(null)
  }

  return (
    <div className="plant-map-page">
      <PageHeader title={d.title} description={d.subtitle} showMockBadge />

      <PlantMapSummary stats={summaryStats} />

      <PlantLegend />

      {isAuthenticated && <PlantMapQuickActions />}

      <PlantLayout
        elements={elements}
        selectedId={selected?.id ?? null}
        onSelect={handleSelectElement}
      />

      <PlantMapAlerts
        alarms={alarms}
        onSelectAlarm={handleSelectAlarm}
        onMarkReviewed={handleMarkReviewed}
      />

      <PlantElementDrawer
        element={selected}
        onClose={() => setSelected(null)}
        cellCode={selected?.name}
      />

      <PlantAlarmDrawer
        alarm={selectedAlarm}
        user={user}
        onClose={() => setSelectedAlarm(null)}
        onMarkReviewed={handleMarkReviewed}
      />
    </div>
  )
}
