import type { Lang } from '../i18n/translations'
import type { BacklogOrder } from '../types/backlog'
import type { CmsaPersistedState, PlantElementView, PlantTable } from '../types/plant'
import { formatTableList, resolveAssignedTableIds } from './tableAssignment'

export type TabletGeneralStatus = 'ok' | 'warning' | 'critical'

export interface TabletKpis {
  activeProduction: number
  occupiedTables: number
  freeTables: number
  activeAlerts: number
  finishingSoon: number
}

export interface TabletAlert {
  id: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  source?: string
  elementId?: string
}

export interface TabletActiveOrder {
  id: string
  reference: string
  company: string
  product: string
  tables: string
  remainingTime: string | null
  endTime: string | null
  eta: string | null
  status: string
  alert: string | null
}

const OCCUPIED_STATUSES = new Set(['occupied', 'validated', 'waiting'])

function isTableOccupied(table: PlantTable): boolean {
  return OCCUPIED_STATUSES.has(table.status)
}

function parseEndTimeMinutes(endTime: string): number | null {
  const match = endTime.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const now = new Date()
  const end = new Date()
  end.setHours(Number(match[1]), Number(match[2]), 0, 0)
  if (end.getTime() <= now.getTime()) end.setDate(end.getDate() + 1)

  return Math.max(1, Math.round((end.getTime() - now.getTime()) / 60000))
}

function formatRemaining(endTime: string, lang: Lang): string {
  const minutes = parseEndTimeMinutes(endTime)
  if (minutes == null) {
    return lang === 'es' ? `~${endTime}` : `~${endTime}`
  }
  return lang === 'es' ? `${minutes} min restantes` : `${minutes} min remaining`
}

export function computeTabletKpis(state: CmsaPersistedState): TabletKpis {
  const activeProduction = state.orders.filter((o) => o.column === 'en_produccion').length
  const occupiedTables = state.plantTables.filter(isTableOccupied).length
  const freeTables = state.plantTables.filter((t) => t.status === 'free').length
  const finishingSoon = state.orders.filter(
    (o) => o.column === 'en_produccion' && o.endTime,
  ).length

  const alerts = buildTabletAlerts(state, 'es')
  const activeAlerts = alerts.filter((a) => a.id !== 'all-ok').length
  return {
    activeProduction,
    occupiedTables,
    freeTables,
    activeAlerts,
    finishingSoon,
  }
}

export function computeGeneralStatus(state: CmsaPersistedState): TabletGeneralStatus {
  const hasCritical =
    state.plantTables.some((t) => t.status === 'conflict' || t.status === 'blocked') ||
    state.plantPalletizers.some((p) => p.status === 'conflict' || p.status === 'blocked') ||
    state.orders.some(
      (o) =>
        o.column === 'en_produccion' &&
        (o.productionState === 'temp_blocked' || o.productionState === 'element_blocked'),
    )

  if (hasCritical) return 'critical'

  const hasWarning =
    state.orders.some((o) => o.column === 'en_preparacion') ||
    state.plantTables.some((t) => t.status === 'waiting') ||
    state.orders.some((o) => o.alerts.length > 0)

  if (hasWarning) return 'warning'
  return 'ok'
}

export function buildTabletAlerts(state: CmsaPersistedState, lang: Lang): TabletAlert[] {
  const alerts: TabletAlert[] = []
  const es = lang === 'es'

  state.plantTables.forEach((table) => {
    if (table.status === 'conflict') {
      alerts.push({
        id: `table-conflict-${table.id}`,
        severity: 'critical',
        message: es
          ? `Mesa ${table.name} en conflicto`
          : `Table ${table.name} in conflict`,
        source: table.name,
        elementId: table.id,
      })
    }
    if (table.status === 'blocked') {
      alerts.push({
        id: `table-blocked-${table.id}`,
        severity: 'critical',
        message: es ? `Mesa ${table.name} bloqueada` : `Table ${table.name} blocked`,
        source: table.name,
        elementId: table.id,
      })
    }
    if (table.status === 'waiting') {
      alerts.push({
        id: `table-waiting-${table.id}`,
        severity: 'warning',
        message: es ? `Mesa ${table.name} en espera` : `Table ${table.name} waiting`,
        source: table.name,
        elementId: table.id,
      })
    }
    if (table.alert && table.status !== 'blocked' && table.status !== 'conflict') {
      alerts.push({
        id: `table-alert-${table.id}`,
        severity: 'warning',
        message: table.alert,
        source: table.name,
        elementId: table.id,
      })
    }
  })

  state.plantPalletizers.forEach((p) => {
    if (p.alert) {
      alerts.push({
        id: `pallet-alert-${p.id}`,
        severity: 'warning',
        message: p.alert,
        source: p.name,
        elementId: p.id,
      })
    }
    if (p.status === 'waiting') {
      alerts.push({
        id: `pallet-waiting-${p.id}`,
        severity: 'warning',
        message: es ? `Paletizador ${p.name} en espera` : `Palletizer ${p.name} waiting`,
        source: p.name,
        elementId: p.id,
      })
    }
  })

  state.orders.forEach((order) => {
    if (order.column === 'en_preparacion') {
      alerts.push({
        id: `order-pending-${order.id}`,
        severity: 'warning',
        message: es
          ? `Pedido ${order.reference} pendiente de validación`
          : `Order ${order.reference} pending validation`,
        source: order.reference,
      })
    }
    if (order.column === 'en_produccion' && order.endTime) {
      alerts.push({
        id: `order-finishing-${order.id}`,
        severity: 'info',
        message: es
          ? `Pedido ${order.reference} próximo a finalizar (~${order.endTime})`
          : `Order ${order.reference} finishing soon (~${order.endTime})`,
        source: order.reference,
      })
    }
    order.alerts.forEach((text, idx) => {
      if (/sobrecarga|overload|falta|cajas|capa/i.test(text)) {
        alerts.push({
          id: `order-alert-${order.id}-${idx}`,
          severity: 'warning',
          message: text,
          source: order.reference,
        })
      }
    })
  })

  if (alerts.length === 0) {
    alerts.push({
      id: 'all-ok',
      severity: 'info',
      message: es ? 'Sin alertas activas relevantes' : 'No relevant active alerts',
    })
  }

  return alerts
}

export function getActiveProductionOrders(
  orders: BacklogOrder[],
  lang: Lang,
): TabletActiveOrder[] {
  return orders
    .filter((o) => o.column === 'en_produccion')
    .map((order) => ({
      id: order.id,
      reference: order.reference,
      company: order.company,
      product: order.product,
      tables: formatTableList(resolveAssignedTableIds(order)),
      remainingTime: order.endTime ? formatRemaining(order.endTime, lang) : null,
      endTime: order.endTime || null,
      eta: order.eta || null,
      status: lang === 'es' ? 'En ejecución' : 'In execution',
      alert: order.alerts[0] ?? null,
    }))
}

export function resolveAlertElement(
  alert: TabletAlert,
  elements: Map<string, PlantElementView>,
): PlantElementView | null {
  if (alert.id === 'all-ok') return null

  if (alert.elementId) {
    const direct = elements.get(alert.elementId)
    if (direct) return direct
  }

  if (alert.source) {
    for (const el of elements.values()) {
      if (el.name === alert.source || el.orderReference === alert.source) return el
    }
  }

  return null
}
