import type { CellAlarm, CellAlarmStatus } from '../types/cellAlarm'

const STORAGE_KEY = 'cmsa-cell-alarms'
const STORAGE_VERSION_KEY = 'cmsa-cell-alarms-version'
const ALARMS_VERSION = '3'

export const MOCK_CELL_ALARMS: CellAlarm[] = [
  {
    id: 'alarm-exceso-001',
    cellCode: 'R4',
    type: 'Exceso de cajas',
    summary: 'Más cajas de las establecidas',
    severity: 'warning',
    time: '11:18',
    orderReference: 'ALM-SUMO-EXCESO-001',
    company: 'SUMO',
    product: 'Naranja',
    variety: 'Navelina',
    message:
      'El objetivo está enviando más cajas de las establecidas para la referencia.',
    status: 'active',
  },
  {
    id: 'alarm-falta-001',
    cellCode: 'R6',
    type: 'Falta de cajas',
    summary: 'Menos cajas de las establecidas',
    severity: 'warning',
    time: '10:52',
    orderReference: 'ALM-MAF-FALTA-001',
    company: 'MAF',
    product: 'Naranja',
    variety: 'Valencia Late',
    message:
      'El objetivo está enviando menos cajas de las establecidas para la referencia.',
    status: 'active',
  },
  {
    id: 'alarm-bloq-001',
    cellCode: 'M2',
    type: 'Bloqueo por incidencia',
    summary: 'Celda bloqueada temporalmente',
    severity: 'critical',
    time: '10:35',
    orderReference: 'ALM-SUMO-BLOQ-001',
    company: 'SUMO',
    product: 'Naranja',
    variety: 'Lane Late',
    message:
      'La celda asociada al objetivo está bloqueada temporalmente por una incidencia.',
    status: 'active',
  },
]

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

export function getCellAlarms(): CellAlarm[] {
  ensureAlarmVersion()
  return readStored() ?? MOCK_CELL_ALARMS
}

export function getAlarmsForCell(cellCode: string): CellAlarm[] {
  return getCellAlarms().filter(
    (alarm) => alarm.cellCode === cellCode && alarm.status !== 'resolved',
  )
}

export function countActiveAlarms(): number {
  return getCellAlarms().filter((alarm) => alarm.status === 'active').length
}

export function saveCellAlarms(alarms: CellAlarm[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
}

export function markAlarmReviewed(alarmId: string): CellAlarm[] {
  const next = getCellAlarms().map((alarm) =>
    alarm.id === alarmId && alarm.status === 'active'
      ? { ...alarm, status: 'reviewed' as CellAlarmStatus }
      : alarm,
  )
  saveCellAlarms(next)
  return next
}

export function resetCellAlarmsMock(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(STORAGE_VERSION_KEY)
}
