import type { Lang } from '../i18n/translations'
import type { BacklogOrder, ValidationTable, ValidationTableStatus } from '../types/backlog'
import type { PlantTable } from '../types/plant'
import { formatTableLabel, isPlantTableId } from './tableAssignment'
import { syncPlantFromValidationTables } from './plantSync'

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

export function createValidationTables(
  order: BacklogOrder,
  tableIds?: string[],
): ValidationTable[] {
  const ids =
    tableIds && tableIds.length > 0
      ? tableIds
      : order.assignedTableIds.length > 0
        ? order.assignedTableIds
        : order.assignedTables.filter(isPlantTableId)

  if (ids.length === 0) return []

  return ids.map((id) => ({
    id: `${order.id}-${id}`,
    plantTableId: id,
    name: formatTableLabel(id),
    type: id.startsWith('R') ? 'automatic' : 'manual',
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
    'Este pedido requiere apoyo de mesas manuales.',
    'This order requires manual table support.',
    'No hay mesas suficientes disponibles para este pedido.',
    'Not enough tables available for this order.',
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

  const ids = tables
    .map((t) => t.plantTableId ?? t.name)
    .filter(Boolean)

  return {
    ...order,
    alerts,
    tablesValidated: allValidated && !hasConflict,
    assignedTableIds: ids,
    assignedTables: ids,
  }
}

export function normalizeOrderValidation(order: BacklogOrder, lang: Lang = 'es'): BacklogOrder {
  let updated: BacklogOrder = {
    ...order,
    assignedTableIds: order.assignedTableIds ?? [],
    assignedTables: order.assignedTables ?? [],
    assignmentMode: order.assignmentMode ?? 'none',
    validationTables: order.validationTables ? [...order.validationTables] : [],
    auditTrail: [...order.auditTrail],
  }

  if (updated.column === 'pendiente_validacion') {
    if (updated.validationTables.length === 0) {
      updated.validationTables = createValidationTables(updated)
      updated.assignedTableIds = updated.validationTables
        .map((t) => t.plantTableId ?? t.name)
        .filter(Boolean)
      updated.assignedTables = updated.assignedTableIds
    } else {
      updated.validationTables = updated.validationTables.map((table) => ({
        ...table,
        plantTableId: table.plantTableId ?? table.name,
        name: formatTableLabel(table.plantTableId ?? table.name),
        type: table.type === 'manual' || table.name.startsWith('M') ? 'manual' : 'automatic',
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
  } else if (updated.validationTables.length === 0 && updated.assignedTableIds.length > 0) {
    updated.validationTables = createValidationTables(updated, updated.assignedTableIds).map(
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

function withPlantSync(order: BacklogOrder, plantTables: PlantTable[]): PlantTable[] {
  return syncPlantFromValidationTables(plantTables, order)
}

export function validateSingleTable(
  order: BacklogOrder,
  tableId: string,
  userName: string,
  lang: Lang,
  plantTables: PlantTable[] = [],
): { order: BacklogOrder; plantTables: PlantTable[] } {
  const table = order.validationTables?.find((t) => t.id === tableId)
  if (!table || table.status === 'validada') {
    return { order, plantTables }
  }

  let updated = updateTable(order, tableId, (t) => ({ ...t, status: 'validada' }))
  updated.auditTrail = [
    ...updated.auditTrail,
    auditEntry(
      lang === 'es' ? `${table.name} validada.` : `${table.name} validated.`,
      userName,
    ),
  ]
  updated = syncOrderValidationState(updated, lang)
  const nextPlant = withPlantSync(updated, plantTables)
  return { order: updated, plantTables: nextPlant }
}

export function validateAllTables(
  order: BacklogOrder,
  userName: string,
  lang: Lang,
  plantTables: PlantTable[] = [],
): { order: BacklogOrder; plantTables: PlantTable[] } {
  let updated: BacklogOrder = {
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
  updated = syncOrderValidationState(updated, lang)
  const nextPlant = withPlantSync(updated, plantTables)
  return { order: updated, plantTables: nextPlant }
}

export function markTableConflict(
  order: BacklogOrder,
  tableId: string,
  reason: string,
  userName: string,
  lang: Lang,
  plantTables: PlantTable[] = [],
): { order: BacklogOrder; plantTables: PlantTable[] } {
  const table = order.validationTables?.find((t) => t.id === tableId)
  if (!table) return { order, plantTables }

  let updated = updateTable(order, tableId, (t) => ({
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
  updated = syncOrderValidationState(updated, lang)
  const nextPlant = withPlantSync(updated, plantTables)
  return { order: updated, plantTables: nextPlant }
}

export function resolveTableConflict(
  order: BacklogOrder,
  tableId: string,
  userName: string,
  lang: Lang,
  plantTables: PlantTable[] = [],
): { order: BacklogOrder; plantTables: PlantTable[] } {
  const table = order.validationTables?.find((t) => t.id === tableId)
  if (!table || table.status !== 'conflicto') {
    return { order, plantTables }
  }

  let updated = updateTable(order, tableId, (t) => ({
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
  updated = syncOrderValidationState(updated, lang)
  const nextPlant = withPlantSync(updated, plantTables)
  return { order: updated, plantTables: nextPlant }
}

export function resetValidationTables(order: BacklogOrder): BacklogOrder {
  return {
    ...order,
    validationTables: [],
    assignedTables: [],
    assignedTableIds: [],
    assignmentMode: 'none',
    tablesValidated: false,
  }
}

export function demoValidateAllTables(
  order: BacklogOrder,
  userName: string,
  lang: Lang,
): BacklogOrder {
  return validateAllTables(order, userName, lang).order
}
