import type { BacklogOrder, ValidationTable } from '../types/backlog'
import type { AssignmentMode, PlantTable } from '../types/plant'

const MANUAL_SUPPORT_ALERT_ES = 'Este pedido requiere apoyo de mesas manuales.'
const MANUAL_SUPPORT_ALERT_EN = 'This order requires manual table support.'
const INSUFFICIENT_ALERT_ES = 'No hay mesas suficientes disponibles para este pedido.'
const INSUFFICIENT_ALERT_EN = 'Not enough tables available for this order.'

export function isPlantTableId(id: string): boolean {
  return /^R\d+$|^M\d+$/i.test(id)
}

export function formatTableLabel(table: string | null | undefined): string {
  if (!table) return ''
  if (isPlantTableId(table)) return table.toUpperCase()
  if (table.startsWith('Mesa ')) return table
  const match = table.match(/^M(\d+)$/i)
  if (match) return `M${match[1]}`
  return table
}

export function formatTableList(tables: Array<string | null | undefined>): string {
  return tables.map(formatTableLabel).filter(Boolean).join(', ')
}

export function resolveAssignedTableIds(order: BacklogOrder): string[] {
  const fromIds = (order.assignedTableIds ?? []).filter(Boolean)
  if (fromIds.length > 0) return fromIds

  const fromAssigned = (order.assignedTables ?? []).filter(Boolean)
  if (fromAssigned.length > 0) return fromAssigned

  return (order.validationTables ?? [])
    .map((t) => t.plantTableId ?? t.name)
    .filter(Boolean)
}

export function isTableAvailable(table: PlantTable): boolean {
  return table.status === 'free'
}

export function getAvailableAutomaticTables(plantTables: PlantTable[]): PlantTable[] {
  return plantTables.filter((t) => t.type === 'automatic' && isTableAvailable(t))
}

export function getAvailableManualTables(plantTables: PlantTable[]): PlantTable[] {
  return plantTables.filter((t) => t.type === 'manual' && isTableAvailable(t))
}

export function orderRequiresManualTables(order: BacklogOrder): boolean {
  if (order.requiresManualTables) return true
  return order.alerts.some((a) => /sobrecarga|overload|manual/i.test(a))
}

export function computeAssignmentMode(ids: string[]): AssignmentMode {
  if (ids.length === 0) return 'none'
  const autoCount = ids.filter((id) => id.startsWith('R')).length
  const manualCount = ids.filter((id) => id.startsWith('M')).length
  if (manualCount === 0) return 'automatic'
  if (autoCount === 0) return 'manual'
  return 'mixed'
}

export function createValidationTablesFromPlant(
  order: BacklogOrder,
  selected: PlantTable[],
): ValidationTable[] {
  return selected.map((table) => ({
    id: `${order.id}-${table.id}`,
    plantTableId: table.id,
    name: table.name,
    type: table.type,
    status: 'pendiente',
    company: order.company,
    orderId: order.id,
    orderReference: order.reference,
  }))
}

function stripAssignmentAlerts(alerts: string[]): string[] {
  const system = new Set([
    MANUAL_SUPPORT_ALERT_ES,
    MANUAL_SUPPORT_ALERT_EN,
    INSUFFICIENT_ALERT_ES,
    INSUFFICIENT_ALERT_EN,
  ])
  return alerts.filter((a) => !system.has(a))
}

export interface AssignTablesResult {
  success: boolean
  order: BacklogOrder
  plantTables: PlantTable[]
  assignmentMode: AssignmentMode
  message?: string
}

export function assignTablesToOrder(
  order: BacklogOrder,
  plantTables: PlantTable[],
  lang: 'es' | 'en' = 'es',
): AssignTablesResult {
  const needed = Math.max(1, order.requiredTables)
  const preferManual = orderRequiresManualTables(order)
  const availableAuto = getAvailableAutomaticTables(plantTables)
  const availableManual = getAvailableManualTables(plantTables)

  const selected: PlantTable[] = []

  if (preferManual) {
    selected.push(...availableManual.slice(0, needed))
    if (selected.length < needed) {
      selected.push(...availableAuto.slice(0, needed - selected.length))
    }
  } else {
    selected.push(...availableAuto.slice(0, needed))
    if (selected.length < needed) {
      selected.push(...availableManual.slice(0, needed - selected.length))
    }
  }

  if (selected.length < needed) {
    const message = lang === 'es' ? INSUFFICIENT_ALERT_ES : INSUFFICIENT_ALERT_EN
    return {
      success: false,
      order: {
        ...order,
        alerts: [...stripAssignmentAlerts(order.alerts), message],
      },
      plantTables,
      assignmentMode: 'none',
      message,
    }
  }

  const selectedIds = new Set(selected.map((t) => t.id))
  const updatedPlant = plantTables.map((table) => {
    if (!selectedIds.has(table.id)) return table
    return {
      ...table,
      status: 'waiting' as const,
      company: order.company,
      orderId: order.id,
      alert: null,
    }
  })

  const ids = selected.map((t) => t.id)
  const assignmentMode = computeAssignmentMode(ids)
  let alerts = stripAssignmentAlerts(order.alerts)

  if (assignmentMode === 'mixed' || assignmentMode === 'manual') {
    alerts = [
      ...alerts,
      lang === 'es' ? MANUAL_SUPPORT_ALERT_ES : MANUAL_SUPPORT_ALERT_EN,
    ]
  }

  const updatedOrder: BacklogOrder = {
    ...order,
    assignedTableIds: ids,
    assignedTables: ids,
    assignmentMode,
    requiresManualTables: preferManual || assignmentMode !== 'automatic',
    validationTables: createValidationTablesFromPlant(order, selected),
    tablesValidated: false,
    alerts,
  }

  return {
    success: true,
    order: updatedOrder,
    plantTables: updatedPlant,
    assignmentMode,
  }
}

export function getAssignmentMessages(lang: 'es' | 'en') {
  return {
    manualSupport: lang === 'es' ? MANUAL_SUPPORT_ALERT_ES : MANUAL_SUPPORT_ALERT_EN,
    insufficient: lang === 'es' ? INSUFFICIENT_ALERT_ES : INSUFFICIENT_ALERT_EN,
  }
}
