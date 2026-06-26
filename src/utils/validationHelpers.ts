import { assignMockTables } from '../data/mockBacklogOrders'
import type { Lang } from '../i18n/translations'
import type { BacklogOrder, ValidationTable, ValidationTableStatus } from '../types/backlog'
import { formatTableLabel } from './backlogStorage'

const CONFLICT_ALERT_ES = 'Hay mesas en conflicto. El pedido no puede iniciar producción.'
const CONFLICT_ALERT_EN =
  'There are tables in conflict. The order cannot start production.'

const PENDING_ALERT_ES = 'Mesas pendientes'
const PENDING_ALERT_EN = 'Tables pending'

function auditEntry(action: string, user?: string): BacklogOrder['auditTrail'][0] {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    timestamp: new Date().toISOString(),
    user,
  }
}

export function createValidationTables(order: BacklogOrder, tableNames?: string[]): ValidationTable[] {
  const names =
    tableNames && tableNames.length > 0
      ? tableNames
      : order.assignedTables.length > 0
        ? order.assignedTables
        : assignMockTables(order.requiredTables)

  return names.map((name, index) => ({
    id: `${order.id}-table-${index + 1}`,
    name: formatTableLabel(name),
    type: index % 2 === 0 ? 'automatica' : 'manual',
    status: 'pendiente',
    company: order.company,
    orderId: order.id,
    orderReference: order.reference,
  }))
}

export function getTableStats(order: BacklogOrder) {
  const tables = order.validationTables ?? []
  return {
    total: tables.length,
    validated: tables.filter((t) => t.status === 'validada').length,
    pending: tables.filter((t) => t.status === 'pendiente').length,
    conflicts: tables.filter((t) => t.status === 'conflicto').length,
    stopped: tables.filter((t) => t.status === 'parada').length,
  }
}

export function hasTableConflicts(order: BacklogOrder): boolean {
  return (order.validationTables ?? []).some((t) => t.status === 'conflicto')
}

export function canStartProduction(order: BacklogOrder): boolean {
  const stats = getTableStats(order)
  return stats.total > 0 && stats.validated === stats.total && stats.conflicts === 0
}

function stripValidationAlerts(alerts: string[]): string[] {
  const systemAlerts = new Set([
    PENDING_ALERT_ES,
    PENDING_ALERT_EN,
    CONFLICT_ALERT_ES,
    CONFLICT_ALERT_EN,
    'Faltan mesas por validar.',
    'Missing tables to validate.',
  ])
  return alerts.filter((a) => !systemAlerts.has(a))
}

export function syncOrderValidationState(order: BacklogOrder, lang: Lang = 'es'): BacklogOrder {
  const tables = order.validationTables ?? []
  const hasConflict = tables.some((t) => t.status === 'conflicto')
  const allValidated = tables.length > 0 && tables.every((t) => t.status === 'validada')

  let alerts = stripValidationAlerts(order.alerts)

  if (hasConflict) {
    alerts = [...alerts, lang === 'es' ? CONFLICT_ALERT_ES : CONFLICT_ALERT_EN]
  } else if (
    !allValidated &&
    tables.length > 0 &&
    order.column === 'pendiente_validacion'
  ) {
    alerts = [...alerts, lang === 'es' ? PENDING_ALERT_ES : PENDING_ALERT_EN]
  }

  return {
    ...order,
    alerts,
    tablesValidated: allValidated && !hasConflict,
    assignedTables: tables.length > 0 ? tables.map((t) => t.name) : order.assignedTables,
  }
}

export function normalizeOrderValidation(order: BacklogOrder, lang: Lang = 'es'): BacklogOrder {
  let updated: BacklogOrder = {
    ...order,
    validationTables: order.validationTables ? [...order.validationTables] : [],
    auditTrail: [...order.auditTrail],
  }

  if (updated.column === 'pendiente_validacion') {
    if (updated.validationTables.length === 0) {
      updated.validationTables = createValidationTables(updated)
    } else {
      updated.validationTables = updated.validationTables.map((table) => ({
        ...table,
        name: formatTableLabel(table.name),
        company: updated.company,
        orderId: updated.id,
        orderReference: updated.reference,
      }))
    }

    if (
      updated.tablesValidated &&
      updated.validationTables.some((t) => t.status !== 'validada' && t.status !== 'conflicto')
    ) {
      updated.validationTables = updated.validationTables.map((table) =>
        table.status === 'conflicto' ? table : { ...table, status: 'validada' },
      )
    }
  } else if (updated.validationTables.length === 0 && updated.assignedTables.length > 0) {
    updated.validationTables = createValidationTables(updated, updated.assignedTables).map(
      (table) => ({
        ...table,
        status: updated.tablesValidated ? ('validada' as ValidationTableStatus) : table.status,
      }),
    )
  }

  return syncOrderValidationState(updated, lang)
}

export function normalizeOrdersValidation(orders: BacklogOrder[], lang: Lang = 'es'): BacklogOrder[] {
  return orders.map((order) => normalizeOrderValidation(order, lang))
}

export function computeValidationKpis(orders: BacklogOrder[]) {
  const pendingOrders = orders.filter((o) => o.column === 'pendiente_validacion')
  let pendingTables = 0
  let validatedTables = 0
  let activeConflicts = 0

  pendingOrders.forEach((order) => {
    const stats = getTableStats(order)
    pendingTables += stats.pending + stats.stopped
    validatedTables += stats.validated
    activeConflicts += stats.conflicts
  })

  return {
    pendingOrders: pendingOrders.length,
    pendingTables,
    validatedTables,
    activeConflicts,
  }
}

export function getPendingValidationOrders(orders: BacklogOrder[]): BacklogOrder[] {
  return orders
    .filter((o) => o.column === 'pendiente_validacion')
    .sort((a, b) => a.priority - b.priority)
}

function updateTable(
  order: BacklogOrder,
  tableId: string,
  updater: (table: ValidationTable) => ValidationTable,
): BacklogOrder {
  return {
    ...order,
    validationTables: (order.validationTables ?? []).map((table) =>
      table.id === tableId ? updater(table) : table,
    ),
  }
}

export function validateSingleTable(
  order: BacklogOrder,
  tableId: string,
  userName: string,
  lang: Lang,
): BacklogOrder {
  const table = order.validationTables?.find((t) => t.id === tableId)
  if (!table || table.status === 'validada') return order

  const updated = updateTable(order, tableId, (t) => ({ ...t, status: 'validada' }))
  updated.auditTrail = [
    ...updated.auditTrail,
    auditEntry(
      lang === 'es' ? `${table.name} validada.` : `${table.name} validated.`,
      userName,
    ),
  ]
  return syncOrderValidationState(updated, lang)
}

export function validateAllTables(
  order: BacklogOrder,
  userName: string,
  lang: Lang,
): BacklogOrder {
  const updated: BacklogOrder = {
    ...order,
    validationTables: (order.validationTables ?? []).map((table) =>
      table.status === 'pendiente' || table.status === 'parada'
        ? { ...table, status: 'validada' }
        : table,
    ),
    auditTrail: [
      ...order.auditTrail,
      auditEntry(
        lang === 'es' ? 'Todas las mesas pendientes validadas.' : 'All pending tables validated.',
        userName,
      ),
    ],
  }
  return syncOrderValidationState(updated, lang)
}

export function markTableConflict(
  order: BacklogOrder,
  tableId: string,
  reason: string,
  userName: string,
  lang: Lang,
): BacklogOrder {
  const table = order.validationTables?.find((t) => t.id === tableId)
  if (!table) return order

  const updated = updateTable(order, tableId, (t) => ({
    ...t,
    status: 'conflicto',
    conflictReason: reason,
  }))
  updated.auditTrail = [
    ...updated.auditTrail,
    auditEntry(
      lang === 'es'
        ? `${table.name} marcada en conflicto: ${reason}`
        : `${table.name} marked in conflict: ${reason}`,
      userName,
    ),
  ]
  return syncOrderValidationState(updated, lang)
}

export function resolveTableConflict(
  order: BacklogOrder,
  tableId: string,
  userName: string,
  lang: Lang,
): BacklogOrder {
  const table = order.validationTables?.find((t) => t.id === tableId)
  if (!table || table.status !== 'conflicto') return order

  const updated = updateTable(order, tableId, (t) => ({
    ...t,
    status: 'pendiente',
    conflictReason: undefined,
  }))
  updated.auditTrail = [
    ...updated.auditTrail,
    auditEntry(
      lang === 'es' ? `Conflicto resuelto en ${table.name}.` : `Conflict resolved on ${table.name}.`,
      userName,
    ),
  ]
  return syncOrderValidationState(updated, lang)
}

export function resetValidationTables(order: BacklogOrder): BacklogOrder {
  return {
    ...order,
    validationTables: [],
    assignedTables: [],
    tablesValidated: false,
  }
}

export function ensureValidationTablesForOrder(order: BacklogOrder): BacklogOrder {
  if (order.column !== 'pendiente_validacion') return order
  const withTables =
    order.validationTables.length > 0
      ? order
      : {
          ...order,
          validationTables: createValidationTables(order),
          assignedTables: createValidationTables(order).map((t) => t.name),
        }
  return withTables
}

export function demoValidateAllTables(
  order: BacklogOrder,
  userName: string,
  lang: Lang,
): BacklogOrder {
  return validateAllTables(order, userName, lang)
}
