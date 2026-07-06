import type { CellAlarm, CellAlarmStatus } from '../types/cellAlarm'
import { DEMO_CELL_ALARMS } from './demoScenario'

const STORAGE_KEY = 'cmsa-cell-alarms'
const STORAGE_VERSION_KEY = 'cmsa-cell-alarms-version'
const ALARMS_VERSION = '5'

export const MOCK_CELL_ALARMS = DEMO_CELL_ALARMS

function readStored(): CellAlarm[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CellAlarm[]
  } catch {
    return null
  }
}

function ensureAlarmVersion(): void {
  const version = localStorage.getItem(STORAGE_VERSION_KEY)
  if (version !== ALARMS_VERSION) {
    localStorage.setItem(STORAGE_VERSION_KEY, ALARMS_VERSION)
    saveCellAlarms(MOCK_CELL_ALARMS)
  }
}

/** Eventos operativos (excluye alarmas reales de seguridad). */
export function getOperationalEvents(): CellAlarm[] {
  ensureAlarmVersion()
  return (readStored() ?? MOCK_CELL_ALARMS).filter((e) => e.category !== 'safety')
}

/** @deprecated Usar getOperationalEvents */
export function getCellAlarms(): CellAlarm[] {
  return getOperationalEvents()
}

export function getAlarmsForCell(cellCode: string): CellAlarm[] {
  return getOperationalEvents().filter(
    (alarm) => alarm.cellCode === cellCode && alarm.status !== 'resolved',
  )
}

export function countActiveAlarms(): number {
  return getOperationalEvents().filter((alarm) => alarm.status === 'active').length
}

export function getEventCellCodes(): Set<string> {
  return new Set(
    getOperationalEvents()
      .filter((e) => e.status !== 'resolved')
      .map((e) => e.cellCode),
  )
}

export function saveCellAlarms(alarms: CellAlarm[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
}

export function markAlarmReviewed(alarmId: string): CellAlarm[] {
  const current = readStored() ?? MOCK_CELL_ALARMS
  const next = current.map((alarm) =>
    alarm.id === alarmId && alarm.status === 'active'
      ? { ...alarm, status: 'reviewed' as CellAlarmStatus }
      : alarm,
  )
  saveCellAlarms(next)
  return next.filter((e) => e.category !== 'safety')
}

export function resetCellAlarmsMock(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(STORAGE_VERSION_KEY)
}
