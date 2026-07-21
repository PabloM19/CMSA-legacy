import type { Lang } from '../i18n/translations'
import type { BacklogOrder } from '../types/backlog'
import { getAlarmsForCell } from '../data/mockCellAlarms'
import { getAdminData } from './adminStorage'
import type {
  PlantElementView,
  PlantPalletizerElement,
  PlantPalletizerStatus,
  PlantSpeedStatus,
  PlantTable,
  PlantTableStatus,
} from '../types/plant'
import { mockOccupancyPercent } from './plantMapSummaryHelpers'

function mockRemainingTime(endTime: string | null, lang: Lang): string | null {
  if (!endTime) return null
  return lang === 'es' ? `~${endTime} restante (sim.)` : `~${endTime} remaining (sim.)`
}

function isElementDisabled(id: string, type: PlantElementView['type']): boolean {
  const data = getAdminData()
  if (type === 'palletizer') {
    const meta = data.palletizerMeta[id]
    return meta?.active === false
  }
  const meta = data.tableMeta[id]
  return meta?.active === false
}

function isCriticalElement(tableName: string, order: BacklogOrder | null): boolean {
  const events = getAlarmsForCell(tableName)
  if (events.some((e) => e.isCritical)) return true
  if (order?.boxes != null && order.boxes >= 10_000) return true
  if (order?.reference && /REF-NAVELINA|REF-VALENCIA-LATE|REF-LANE-LATE/i.test(order.reference)) {
    return true
  }
  return false
}

function tableToView(table: PlantTable, order: BacklogOrder | null, lang: Lang): PlantElementView {
  const disabled = isElementDisabled(table.id, table.type)
  const critical = !disabled && isCriticalElement(table.name, order)
  return {
    id: table.id,
    name: table.name,
    type: table.type,
    status: disabled ? 'free' : table.status,
    company: disabled ? null : table.company,
    orderId: disabled ? null : table.orderId,
    orderReference: disabled ? null : (order?.reference ?? null),
    product: disabled ? null : (order?.product ?? null),
    variety: disabled ? null : (order?.variety ?? null),
    boxes: disabled ? null : (order?.boxes ?? null),
    boxesPerHour: disabled ? null : (order?.boxesPerHour ?? null),
    eta: disabled ? null : (order?.etc ?? order?.eta ?? null),
    endTime: disabled ? null : (order?.endTime ?? null),
    remainingTime: disabled ? null : mockRemainingTime(order?.endTime ?? null, lang),
    speedStatus: disabled ? null : table.speedStatus,
    occupancyPercent: disabled ? null : mockOccupancyPercent(table),
    alert: disabled ? null : table.alert,
    isClickable: !disabled,
    isDisabled: disabled,
    isCritical: critical,
  }
}

function palletizerToView(
  p: PlantPalletizerElement,
  order: BacklogOrder | null,
  lang: Lang,
): PlantElementView {
  const disabled = isElementDisabled(p.id, 'palletizer')
  return {
    id: p.id,
    name: p.name,
    type: 'palletizer',
    status: disabled ? 'idle' : p.status,
    company: disabled ? null : p.company,
    orderId: disabled ? null : p.orderId,
    orderReference: disabled ? null : (order?.reference ?? null),
    product: disabled ? null : (order?.product ?? null),
    variety: disabled ? null : (order?.variety ?? null),
    boxes: disabled ? null : (order?.boxes ?? null),
    boxesPerHour: disabled ? null : (order?.boxesPerHour ?? null),
    eta: disabled ? null : (order?.etc ?? order?.eta ?? null),
    endTime: disabled ? null : (order?.endTime ?? null),
    remainingTime: disabled ? null : mockRemainingTime(order?.endTime ?? null, lang),
    speedStatus: null,
    occupancyPercent: disabled
      ? null
      : order?.occupancyPercent ??
        (p.status === 'active'
          ? 68
          : p.status === 'waiting'
            ? 22
            : null),
    alert: disabled ? null : p.alert,
    isClickable: !disabled,
    isDisabled: disabled,
    isCritical: false,
  }
}

export function buildPlantElementMap(
  tables: PlantTable[],
  palletizers: PlantPalletizerElement[],
  orders: BacklogOrder[],
  lang: Lang,
): Map<string, PlantElementView> {
  const orderMap = new Map(orders.map((o) => [o.id, o]))
  const map = new Map<string, PlantElementView>()

  tables.forEach((table) => {
    const order = table.orderId ? orderMap.get(table.orderId) ?? null : null
    map.set(table.id, tableToView(table, order, lang))
  })

  palletizers.forEach((p) => {
    const order = p.orderId ? orderMap.get(p.orderId) ?? null : null
    map.set(p.id, palletizerToView(p, order, lang))
  })

  return map
}

export function getStatusLabel(
  status: PlantTableStatus | PlantPalletizerStatus,
  lang: Lang,
): string {
  const es: Record<string, string> = {
    free: 'Libre',
    validated: 'Validada',
    occupied: 'En producción',
    waiting: 'En espera temporal',
    blocked: 'Bloqueo temporal',
    conflict: 'Elemento bloqueado',
    active: 'En producción',
    idle: 'Inactivo',
  }
  const en: Record<string, string> = {
    free: 'Free',
    validated: 'Validated',
    occupied: 'In production',
    waiting: 'Temporary wait',
    blocked: 'Temporary block',
    conflict: 'Element blocked',
    active: 'In production',
    idle: 'Idle',
  }
  const dict = lang === 'es' ? es : en
  return dict[status] ?? status
}

export function getSpeedLabel(speed: PlantSpeedStatus, lang: Lang): string | null {
  if (!speed) return null
  if (lang === 'es') {
    return speed === 'slow' ? 'Lento' : speed === 'fast' ? 'Rápido' : 'Normal'
  }
  return speed === 'slow' ? 'Slow' : speed === 'fast' ? 'Fast' : 'Normal'
}

export function getTypeLabel(type: PlantElementView['type'], lang: Lang): string {
  if (lang === 'es') {
    if (type === 'automatic') return 'Robot'
    if (type === 'manual') return 'Mesa manual'
    return 'Paletizador'
  }
  if (type === 'automatic') return 'Robot'
  if (type === 'manual') return 'Manual table'
  return 'Palletizer'
}

export function statusCssClass(
  status: PlantTableStatus | PlantPalletizerStatus,
  isDisabled?: boolean,
): string {
  if (isDisabled) return 'disabled'
  if (status === 'active') return 'occupied'
  if (status === 'idle') return 'free'
  if (status === 'conflict') return 'blocked-critical'
  return status
}

export function hasCriticalBlink(status: PlantTableStatus | PlantPalletizerStatus): boolean {
  return status === 'conflict'
}
