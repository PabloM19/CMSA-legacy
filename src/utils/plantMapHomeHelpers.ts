import type { Lang } from '../i18n/translations'
import type { BacklogOrder } from '../types/backlog'
import { isInProductionColumn, isPendingAcceptanceColumn } from './dailyOrderHelpers'
import { formatTableList, resolveAssignedTableIds } from './tableAssignment'

export type HomeActiveOrderSort = 'ends_soon' | 'most_production' | 'status' | 'company'

export type HomeOrderVisualState = 'running' | 'waiting' | 'error'

export interface HomeActiveOrderRow {
  id: string
  orderNumber: string
  reference: string
  variety: string | null
  company: BacklogOrder['company']
  tables: string
  endTime: string | null
  etc: string | null
  remainingLabel: string | null
  statusLabel: string
  visualState: HomeOrderVisualState
  progressPercent: number
  sortMinutes: number
  sortProduction: number
  sortStatus: number
  sortCompany: number
  alert: string | null
}

function parseEndTimeMinutes(endTime: string): number | null {
  const match = endTime.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const now = new Date()
  const end = new Date()
  end.setHours(Number(match[1]), Number(match[2]), 0, 0)

  if (end.getTime() <= now.getTime()) {
    end.setDate(end.getDate() + 1)
  }

  return Math.max(1, Math.round((end.getTime() - now.getTime()) / 60000))
}

function formatRemaining(minutes: number | null, lang: Lang): string | null {
  if (minutes == null) return null
  return lang === 'es' ? `${minutes} min restantes` : `${minutes} min remaining`
}

function resolveEstimatedEnd(order: BacklogOrder): string | null {
  return order.endTime || order.etc || order.eta || null
}

function isActiveProductionOrder(order: BacklogOrder): boolean {
  return isInProductionColumn(order) || isPendingAcceptanceColumn(order) || order.column === 'en_preparacion'
}

function resolveOrderProgress(order: BacklogOrder): number {
  if (order.boxes > 0 && order.boxesProduced != null) {
    return Math.min(100, Math.round((order.boxesProduced / order.boxes) * 100))
  }
  if (order.occupancyPercent != null) {
    return Math.min(100, Math.round(order.occupancyPercent))
  }
  return 0
}

function resolveHomeOrderVisualState(order: BacklogOrder): HomeOrderVisualState {
  if (
    order.productionState === 'element_blocked' ||
    order.productionState === 'temp_blocked'
  ) {
    return 'error'
  }
  if (isPendingAcceptanceColumn(order) || order.column === 'en_preparacion') {
    return 'waiting'
  }
  if (order.productionState === 'temp_waiting') {
    return 'waiting'
  }
  return 'running'
}

function resolveStatusSortRank(order: BacklogOrder, visualState: HomeOrderVisualState): number {
  if (visualState === 'running') return 0
  if (visualState === 'waiting') return isInProductionColumn(order) ? 1 : 2
  return 3
}

function resolveStatusLabel(order: BacklogOrder, lang: Lang): string {
  const es = lang === 'es'
  if (isInProductionColumn(order)) {
    if (order.productionState === 'temp_waiting') {
      return es ? 'En espera' : 'On hold'
    }
    if (order.productionState === 'element_blocked' || order.productionState === 'temp_blocked') {
      return es ? 'Bloqueada' : 'Blocked'
    }
    return es ? 'En producción' : 'In production'
  }
  if (isPendingAcceptanceColumn(order)) {
    return es ? 'Pendiente aceptación' : 'Pending acceptance'
  }
  return es ? 'En preparación' : 'In preparation'
}

export function mapHomeActiveProductionOrders(
  orders: BacklogOrder[],
  lang: Lang,
): HomeActiveOrderRow[] {
  return orders.filter(isActiveProductionOrder).map((order) => {
    const endTime = resolveEstimatedEnd(order)
    const sortMinutes = endTime ? parseEndTimeMinutes(endTime) ?? 9999 : 9999
    const progressPercent = resolveOrderProgress(order)
    const visualState = resolveHomeOrderVisualState(order)
    const produced = order.boxesProduced ?? (progressPercent / 100) * order.boxes

    return {
      id: order.id,
      orderNumber: order.id,
      reference: order.reference,
      variety: order.variety?.trim() ? order.variety : null,
      company: order.company,
      tables: formatTableList(resolveAssignedTableIds(order)),
      endTime,
      etc: order.etc || order.eta || null,
      remainingLabel: endTime ? formatRemaining(parseEndTimeMinutes(endTime), lang) : null,
      statusLabel: resolveStatusLabel(order, lang),
      visualState,
      progressPercent,
      sortMinutes,
      sortProduction: produced,
      sortStatus: resolveStatusSortRank(order, visualState),
      sortCompany: order.company === 'SUMO' ? 0 : 1,
      alert: order.alerts[0] ?? null,
    }
  })
}

export function sortHomeActiveOrders(
  rows: HomeActiveOrderRow[],
  sortBy: HomeActiveOrderSort,
): HomeActiveOrderRow[] {
  const sorted = [...rows]

  switch (sortBy) {
    case 'most_production':
      sorted.sort(
        (a, b) =>
          b.progressPercent - a.progressPercent ||
          b.sortProduction - a.sortProduction ||
          a.sortMinutes - b.sortMinutes,
      )
      break
    case 'status':
      sorted.sort(
        (a, b) =>
          a.sortStatus - b.sortStatus ||
          a.sortMinutes - b.sortMinutes ||
          a.orderNumber.localeCompare(b.orderNumber),
      )
      break
    case 'company':
      sorted.sort(
        (a, b) =>
          a.sortCompany - b.sortCompany ||
          a.sortMinutes - b.sortMinutes ||
          a.orderNumber.localeCompare(b.orderNumber),
      )
      break
    case 'ends_soon':
    default:
      sorted.sort(
        (a, b) =>
          a.sortMinutes - b.sortMinutes ||
          b.progressPercent - a.progressPercent ||
          a.orderNumber.localeCompare(b.orderNumber),
      )
      break
  }

  return sorted
}

/** Órdenes activas para Inicio (orden por defecto: acaba antes). */
export function getHomeActiveProductionOrders(
  orders: BacklogOrder[],
  lang: Lang,
  sortBy: HomeActiveOrderSort = 'ends_soon',
): HomeActiveOrderRow[] {
  return sortHomeActiveOrders(mapHomeActiveProductionOrders(orders, lang), sortBy)
}

export function getHomeOrderSortLabel(sortBy: HomeActiveOrderSort, lang: Lang): string {
  const es: Record<HomeActiveOrderSort, string> = {
    ends_soon: 'Acaba antes',
    most_production: 'Mayor producción',
    status: 'Estado',
    company: 'Empresa',
  }
  const en: Record<HomeActiveOrderSort, string> = {
    ends_soon: 'Finishes first',
    most_production: 'Most production',
    status: 'Status',
    company: 'Company',
  }
  return (lang === 'es' ? es : en)[sortBy]
}
