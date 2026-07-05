import type { CellAlarm, CellAlarmStatus } from '../types/cellAlarm'

const STORAGE_KEY = 'cmsa-cell-alarms'
const STORAGE_VERSION_KEY = 'cmsa-cell-alarms-version'
const ALARMS_VERSION = '4'

export const MOCK_CELL_ALARMS: CellAlarm[] = [
  {
    id: 'evt-exceso-001',
    cellCode: 'R4',
    type: 'Exceso de cajas',
    summary: 'Más cajas de las establecidas',
    severity: 'warning',
    time: '11:18',
    orderReference: 'REF-DISPLAY-PACK',
    company: 'SUMO',
    product: 'Naranja',
    variety: 'Display Pack',
    message:
      'La orden de producción está enviando más cajas de las establecidas para la referencia.',
    status: 'active',
    category: 'operational',
    isCritical: true,
  },
  {
    id: 'evt-falta-001',
    cellCode: 'R6',
    type: 'Falta de cajas',
    summary: 'Menos cajas de las establecidas',
    severity: 'warning',
    time: '10:52',
    orderReference: 'REF-SMCSMR-7CT',
    company: 'MAF',
    product: 'Naranja',
    variety: 'smCsmr 7ct',
    message:
      'La orden de producción está enviando menos cajas de las establecidas para la referencia.',
    status: 'active',
    category: 'operational',
  },
  {
    id: 'evt-receta-001',
    cellCode: 'R3',
    type: 'Cambio de receta pendiente',
    summary: 'Receta pendiente de confirmación',
    severity: 'info',
    time: '10:41',
    orderReference: 'PO-CT-001',
    company: 'SUMO',
    product: 'Naranja',
    variety: 'Cartons',
    message: 'Cambio de receta pendiente de confirmación por operario.',
    status: 'active',
    category: 'operational',
  },
  {
    id: 'evt-bloq-001',
    cellCode: 'M2',
    type: 'Bloqueo por ocupación',
    summary: 'Celda bloqueada por ocupación',
    severity: 'critical',
    time: '10:35',
    orderReference: 'PO-DP-2',
    company: 'SUMO',
    product: 'Naranja',
    variety: 'Display Pack',
    message: 'Bloqueo por ocupación: la celda no puede aceptar más carga en este momento.',
    status: 'active',
    category: 'operational',
    isCritical: true,
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
