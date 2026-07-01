import type { Lang } from '../i18n/translations'
import type { BacklogOrder } from '../types/backlog'
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

function tableToView(table: PlantTable, order: BacklogOrder | null, lang: Lang): PlantElementView {
  return {
    id: table.id,
    name: table.name,
    type: table.type,
    status: table.status,
    company: table.company,
    orderId: table.orderId,
    orderReference: order?.reference ?? null,
    product: order?.product ?? null,
    variety: order?.variety ?? null,
    boxes: order?.boxes ?? null,
    boxesPerHour: order?.boxesPerHour ?? null,
    eta: order?.eta ?? null,
    endTime: order?.endTime ?? null,
    remainingTime: mockRemainingTime(order?.endTime ?? null, lang),
    speedStatus: table.speedStatus,
    occupancyPercent: mockOccupancyPercent(table),
    alert: table.alert,
    isClickable: true,
  }
}

function palletizerToView(p: PlantPalletizerElement): PlantElementView {
  return {
    id: p.id,
    name: p.name,
    type: 'palletizer',
    status: p.status,
    company: p.company,
    orderId: p.orderId,
    orderReference: null,
    product: null,
    variety: null,
    boxes: null,
    boxesPerHour: null,
    eta: null,
    endTime: null,
    remainingTime: null,
    speedStatus: null,
    occupancyPercent: p.status === 'active' ? 68 : p.status === 'waiting' ? 22 : null,
    alert: p.alert,
    isClickable: true,
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
    map.set(p.id, palletizerToView(p))
  })

  return map
}

export function getStatusLabel(
  status: PlantTableStatus | PlantPalletizerStatus,
  lang: Lang,
): string {
  const es: Record<string, string> = {
    free: 'Libre',
    reserved: 'Reservada',
    preparing: 'Pendiente de preparación',
    pending_validation: 'Esperando confirmación de celda',
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
    reserved: 'Reserved',
    preparing: 'Pending preparation',
    pending_validation: 'Awaiting cell confirmation',
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
    if (type === 'automatic') return 'Automática'
    if (type === 'manual') return 'Manual'
    return 'Paletizador'
  }
  if (type === 'automatic') return 'Automatic'
  if (type === 'manual') return 'Manual'
  return 'Palletizer'
}

export function statusCssClass(status: PlantTableStatus | PlantPalletizerStatus): string {
  if (status === 'preparing') return 'preparing'
  if (status === 'pending_validation' || status === 'reserved') return 'preparing'
  if (status === 'active') return 'occupied'
  if (status === 'idle') return 'free'
  if (status === 'conflict') return 'blocked-critical'
  return status
}

export function hasCriticalBlink(status: PlantTableStatus | PlantPalletizerStatus): boolean {
  return status === 'conflict'
}
