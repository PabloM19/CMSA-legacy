import type { Lang } from '../i18n/translations'
import type { BacklogOrder } from '../types/backlog'
import type { PlantElementView, PlantSpeedStatus } from '../types/plant'

export type PlantMapProductionStatusTone = 'running' | 'waiting' | 'error'

export interface PlantMapProductionStation {
  id: string
  code: string
  type: PlantElementView['type']
}

export interface PlantMapProductionRow {
  id: string
  orderId: string | null
  orderNumber: string
  reference: string
  company: BacklogOrder['company'] | null
  stations: PlantMapProductionStation[]
  typeLabel: string
  statusLabel: string
  statusTone: PlantMapProductionStatusTone
  progressPercent: number
  speedStatus: PlantSpeedStatus
  etc: string | null
  focusElementId: string
}

function isVisibleProductionElement(element: PlantElementView): boolean {
  if (element.status === 'free' || element.status === 'idle') return false
  if (element.isDisabled && !element.alert) return false
  if (!element.orderId && !element.orderReference && !element.company) return false
  return true
}

function resolveProgress(order: BacklogOrder | null): number {
  if (!order) return 0
  if (order.boxes > 0 && order.boxesProduced != null) {
    return Math.min(100, Math.round((order.boxesProduced / order.boxes) * 100))
  }
  if (order.occupancyPercent != null) {
    return Math.min(100, Math.round(order.occupancyPercent))
  }
  return 0
}

function resolveSpeedStatus(elements: PlantElementView[]): PlantSpeedStatus {
  const speeds = elements.map((el) => el.speedStatus).filter(Boolean) as NonNullable<PlantSpeedStatus>[]
  if (speeds.includes('slow')) return 'slow'
  if (speeds.includes('fast')) return 'fast'
  return speeds[0] ?? 'normal'
}

function resolveTypeLabel(elements: PlantElementView[], lang: Lang): string {
  const types = new Set(elements.map((el) => el.type))
  const es = lang === 'es'
  if (types.size > 1) return es ? 'Mixta' : 'Mixed'
  const type = elements[0]?.type
  if (type === 'automatic') return es ? 'Robotizada' : 'Robotic'
  if (type === 'manual') return es ? 'Mesa manual' : 'Manual table'
  return es ? 'Paletizador' : 'Palletizer'
}

function resolveStatus(
  elements: PlantElementView[],
  order: BacklogOrder | null,
  lang: Lang,
): { label: string; tone: PlantMapProductionStatusTone } {
  const es = lang === 'es'
  const hasConflict = elements.some((el) => el.status === 'conflict')
  const hasBlocked = elements.some((el) => el.status === 'blocked')
  const hasWaiting = elements.some((el) => el.status === 'waiting')

  if (hasConflict) {
    return { label: es ? 'Error / bloqueo' : 'Error / block', tone: 'error' }
  }
  if (hasBlocked || order?.productionState === 'temp_blocked' || order?.productionState === 'element_blocked') {
    return { label: es ? 'Bloqueo' : 'Blocked', tone: 'error' }
  }
  if (hasWaiting || order?.productionState === 'temp_waiting') {
    return { label: es ? 'En espera' : 'On hold', tone: 'waiting' }
  }
  return { label: es ? 'En producción' : 'In production', tone: 'running' }
}

function resolveEtc(elements: PlantElementView[], order: BacklogOrder | null): string | null {
  const elementEta = elements.find((el) => el.eta)?.eta
  if (elementEta) return elementEta
  if (order?.etc) return order.etc
  if (order?.eta) return order.eta
  if (order?.endTime) return order.endTime
  return null
}

function buildRow(
  groupKey: string,
  elements: PlantElementView[],
  orderMap: Map<string, BacklogOrder>,
  lang: Lang,
): PlantMapProductionRow {
  const sorted = [...elements].sort((a, b) => a.name.localeCompare(b.name))
  const primary = sorted[0]
  const order = primary.orderId ? orderMap.get(primary.orderId) ?? null : null
  const { label, tone } = resolveStatus(sorted, order, lang)

  return {
    id: groupKey,
    orderId: primary.orderId,
    orderNumber: primary.orderId ?? '—',
    reference: primary.orderReference ?? order?.reference ?? '—',
    company: primary.company ?? order?.company ?? null,
    stations: sorted.map((el) => ({ id: el.id, code: el.name, type: el.type })),
    typeLabel: resolveTypeLabel(sorted, lang),
    statusLabel: label,
    statusTone: tone,
    progressPercent: resolveProgress(order),
    speedStatus: resolveSpeedStatus(sorted),
    etc: resolveEtc(sorted, order),
    focusElementId: primary.id,
  }
}

/** Filas de producción actual derivadas del mismo mapa que renderiza el pictograma. */
export function mapPlantMapProductionRows(
  elements: Map<string, PlantElementView>,
  orders: BacklogOrder[],
  lang: Lang,
): PlantMapProductionRow[] {
  const orderMap = new Map(orders.map((order) => [order.id, order]))
  const groups = new Map<string, PlantElementView[]>()

  elements.forEach((element) => {
    if (!isVisibleProductionElement(element)) return
    const key = element.orderId ?? element.id
    const current = groups.get(key) ?? []
    current.push(element)
    groups.set(key, current)
  })

  return [...groups.values()]
    .map((group) => buildRow(group[0].orderId ?? group[0].id, group, orderMap, lang))
    .sort((a, b) => a.orderNumber.localeCompare(b.orderNumber) || a.reference.localeCompare(b.reference))
}
