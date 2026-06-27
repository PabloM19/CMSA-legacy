import type { Lang } from '../i18n/translations'
import type { BacklogOrder } from '../types/backlog'
import type { CmsaPersistedState, PlantTable } from '../types/plant'
import { formatTableList, resolveAssignedTableIds } from './tableAssignment'

export type TabletGeneralStatus = 'ok' | 'warning' | 'critical'

export interface TabletKpis {
  activeProduction: number
  occupiedTables: number
  freeTables: number
  activeAlerts: number
}

export interface TabletAlert {
  id: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  source?: string
}

export interface TabletActiveOrder {
  id: string
  reference: string
  company: string
  tables: string
  remainingTime: string | null
  status: string
  alert: string | null
}

const OCCUPIED_STATUSES = new Set([
  'occupied',
  'pending_validation',
  'validated',
  'reserved',
  'waiting',
])

function isTableOccupied(table: PlantTable): boolean {
  return OCCUPIED_STATUSES.has(table.status)
}

export function computeTabletKpis(state: CmsaPersistedState): TabletKpis {
  const activeProduction = state.orders.filter((o) => o.column === 'en_ejecucion').length
  const occupiedTables = state.plantTables.filter(isTableOccupied).length
  const freeTables = state.plantTables.filter((t) => t.status === 'free').length

  const alerts = buildTabletAlerts(state, 'es')
  const activeAlerts = alerts.filter((a) => a.id !== 'all-ok').length
  return {
    activeProduction,
    occupiedTables,
    freeTables,
    activeAlerts,
  }
}

export function computeGeneralStatus(state: CmsaPersistedState): TabletGeneralStatus {
  const hasCritical =
    state.plantTables.some((t) => t.status === 'conflict' || t.status === 'blocked') ||
    state.plantPalletizers.some((p) => p.status === 'conflict' || p.status === 'blocked') ||
    state.orders.some((o) => o.column === 'bloqueado')

  if (hasCritical) return 'critical'

  const hasWarning =
    state.orders.some((o) => o.column === 'pendiente_validacion') ||
    state.plantTables.some((t) => t.status === 'waiting' || t.status === 'pending_validation') ||
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
      })
    }
    if (table.status === 'blocked') {
      alerts.push({
        id: `table-blocked-${table.id}`,
        severity: 'critical',
        message: es ? `Mesa ${table.name} bloqueada` : `Table ${table.name} blocked`,
        source: table.name,
      })
    }
    if (table.status === 'waiting') {
      alerts.push({
        id: `table-waiting-${table.id}`,
        severity: 'warning',
        message: es ? `Mesa ${table.name} en espera` : `Table ${table.name} waiting`,
        source: table.name,
      })
    }
    if (table.alert && table.status !== 'blocked' && table.status !== 'conflict') {
      alerts.push({
        id: `table-alert-${table.id}`,
        severity: 'warning',
        message: table.alert,
        source: table.name,
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
      })
    }
  })

  state.orders.forEach((order) => {
    if (order.column === 'pendiente_validacion') {
      alerts.push({
        id: `order-pending-${order.id}`,
        severity: 'warning',
        message: es
          ? `Pedido ${order.reference} pendiente de validación`
          : `Order ${order.reference} pending validation`,
        source: order.reference,
      })
    }
    if (order.column === 'en_ejecucion' && order.endTime) {
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
    .filter((o) => o.column === 'en_ejecucion')
    .map((order) => ({
      id: order.id,
      reference: order.reference,
      company: order.company,
      tables: formatTableList(resolveAssignedTableIds(order)),
      remainingTime: order.endTime
        ? lang === 'es'
          ? `~${order.endTime} restante (sim.)`
          : `~${order.endTime} remaining (sim.)`
        : null,
      status: lang === 'es' ? 'En ejecución' : 'In execution',
      alert: order.alerts[0] ?? null,
    }))
}
