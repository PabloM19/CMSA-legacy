import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import {
  getEventCellCodes,
  getOperationalEvents,
  markAlarmReviewed,
} from '../../../data/mockCellAlarms'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { CellAlarm } from '../../../types/cellAlarm'
import { logAlarmReviewed } from '../../../utils/activityLogActions'
import { isSupervisor } from '../../../utils/permissions'
import { getState } from '../../../utils/backlogStorage'
import { buildPlantElementMap } from '../../../utils/plantMapHelpers'
import type { PlantMapViewFilter } from '../../../utils/plantMapViewFilter'
import { computePlantMapSummaryStats } from '../../../utils/plantMapSummaryHelpers'
import {
  activateSafetyAlarmMock,
  getSafetyAlarmActivatedAt,
  isSafetyAlarmActive,
} from '../../../utils/safetyAlarmMock'
import { PlantMapActiveOrders } from '../components/PlantMapActiveOrders'
import { PlantAlarmDrawer } from '../components/PlantAlarmDrawer'
import { PlantElementDrawer } from '../components/PlantElementDrawer'
import { PlantLayout } from '../components/PlantLayout'
import { PlantLegend } from '../components/PlantLegend'
import { PlantMapAlerts } from '../components/PlantMapAlerts'
import { PlantMapQuickActions } from '../components/PlantMapQuickActions'
import { PlantMapSummary } from '../components/PlantMapSummary'
import { PlantMapViewFilterBar } from '../components/PlantMapViewFilterBar'
import { SafetyAlarmModal } from '../components/SafetyAlarmModal'
import type { PlantElementView } from '../../../types/plant'
import '../../dashboard/dashboard.css'
import '../plant-map.css'

/** Vista escritorio — se activa por ancho (≥1100px) dentro de /plant-map */
export function PlantMapDesktopView() {
  const { user, isAuthenticated } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.plantMap

  const [state, setState] = useState(() => getState())
  const [events, setEvents] = useState<CellAlarm[]>(() => getOperationalEvents())
  const [selected, setSelected] = useState<PlantElementView | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CellAlarm | null>(null)
  const [viewFilter, setViewFilter] = useState<PlantMapViewFilter>('all')
  const [safetyActive, setSafetyActive] = useState(() => isSafetyAlarmActive())
  const [safetyAt, setSafetyAt] = useState<number | null>(() => getSafetyAlarmActivatedAt())

  useEffect(() => {
    setState(getState())
    setEvents(getOperationalEvents())
    setSelected(null)
    setSelectedEvent(null)
    setSafetyActive(isSafetyAlarmActive())
    setSafetyAt(getSafetyAlarmActivatedAt())
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

  const eventCellCodes = useMemo(() => getEventCellCodes(), [events])

  const summaryStats = useMemo(
    () => computePlantMapSummaryStats(elements, state.orders),
    [elements, state.orders],
  )

  function handleMarkReviewed(event: CellAlarm) {
    if (!user || !isSupervisor(user)) return
    const next = markAlarmReviewed(event.id)
    setEvents(next)
    logAlarmReviewed(user, event.id)
    if (selectedEvent?.id === event.id) {
      setSelectedEvent(next.find((item) => item.id === event.id) ?? null)
    }
  }

  function handleSelectEvent(event: CellAlarm) {
    if (safetyActive) return
    setSelectedEvent(event)
    setSelected(null)
  }

  function handleSelectElement(element: PlantElementView) {
    if (safetyActive || element.isDisabled) return
    setSelected(element)
    setSelectedEvent(null)
  }

  function handleSimulateSafetyAlarm() {
    activateSafetyAlarmMock()
    setSafetyActive(true)
    setSafetyAt(Date.now())
    setSelected(null)
    setSelectedEvent(null)
  }

  function handleSafetyResolved() {
    setSafetyActive(false)
    setSafetyAt(null)
  }

  const blocked = safetyActive

  return (
    <div className={`plant-map-page${blocked ? ' plant-map-page--safety-blocked' : ''}`}>
      <PageHeader title={d.title} description={d.subtitle} showMockBadge />

      <PlantMapSummary stats={summaryStats} />

      <PlantLegend />

      {isAuthenticated && (
        <PlantMapQuickActions onSimulateSafetyAlarm={handleSimulateSafetyAlarm} safetyBlocked={blocked} />
      )}

      <PlantMapViewFilterBar value={viewFilter} onChange={setViewFilter} />

      <PlantLayout
        elements={elements}
        selectedId={selected?.id ?? null}
        onSelect={handleSelectElement}
        viewFilter={viewFilter}
        eventCellCodes={eventCellCodes}
      />

      <PlantMapActiveOrders
        elements={elements}
        orders={state.orders}
        onViewElement={handleSelectElement}
      />

      <PlantMapAlerts
        alarms={events}
        onSelectAlarm={handleSelectEvent}
        onMarkReviewed={handleMarkReviewed}
      />

      {!blocked && (
        <>
          <PlantElementDrawer
            element={selected}
            onClose={() => setSelected(null)}
            cellCode={selected?.name}
          />

          <PlantAlarmDrawer
            alarm={selectedEvent}
            user={user}
            onClose={() => setSelectedEvent(null)}
            onMarkReviewed={handleMarkReviewed}
          />
        </>
      )}

      {blocked && safetyAt != null && (
        <SafetyAlarmModal activatedAt={safetyAt} onResolved={handleSafetyResolved} />
      )}
    </div>
  )
}
