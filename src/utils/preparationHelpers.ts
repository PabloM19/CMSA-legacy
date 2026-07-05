import type { BacklogOrder } from '../types/backlog'
import type { PlantTable } from '../types/plant'
import {
  computeAssignmentMode,
  createValidationTablesFromPlant,
  getAvailableAutomaticTables,
  getAvailableManualTables,
} from './tableAssignment'

export interface StationRecommendation {
  recommended: string[]
  available: string[]
}

export function recommendStations(
  order: BacklogOrder,
  plantTables: PlantTable[],
): StationRecommendation {
  const needed = Math.max(2, order.requiredTables)
  const auto = getAvailableAutomaticTables(plantTables)
  const manual = getAvailableManualTables(plantTables)
  const available = [...auto, ...manual].map((t) => t.id)

  const recommended: string[] = []
  for (const table of auto) {
    if (recommended.length >= needed) break
    recommended.push(table.id)
  }
  for (const table of manual) {
    if (recommended.length >= needed) break
    recommended.push(table.id)
  }

  return { recommended, available }
}

export function reserveStationsForOrder(
  order: BacklogOrder,
  plantTables: PlantTable[],
  selectedIds: string[],
): { order: BacklogOrder; plantTables: PlantTable[]; success: boolean; message?: string } {
  const needed = Math.max(2, order.requiredTables)

  if (selectedIds.length < needed) {
    return {
      order,
      plantTables,
      success: false,
      message: `Se requieren al menos ${needed} estaciones.`,
    }
  }

  const idSet = new Set(selectedIds)
  const selected = plantTables.filter((t) => idSet.has(t.id))

  if (selected.length !== selectedIds.length) {
    return { order, plantTables, success: false, message: 'Estación no válida.' }
  }

  const unavailable = selected.filter((t) => t.status !== 'free')
  if (unavailable.length > 0) {
    return {
      order,
      plantTables,
      success: false,
      message: `${unavailable.map((t) => t.id).join(', ')} no está disponible.`,
    }
  }

  const validationTables = createValidationTablesFromPlant(order, selected)
  const assignmentMode = computeAssignmentMode(selectedIds)

  const nextPlant = plantTables.map((t) => {
    if (!idSet.has(t.id)) return t
    return {
      ...t,
      status: 'preparing' as const,
      company: order.company,
      orderId: order.id,
    }
  })

  const nextOrder: BacklogOrder = {
    ...order,
    column: 'en_preparacion',
    preparationStatus: 'waiting_cell',
    assignedTableIds: selectedIds,
    assignedTables: selectedIds,
    assignmentMode,
    validationTables,
    tablesValidated: false,
    alerts: order.alerts.filter((a) => !a.includes('Pendiente de aceptación')),
    auditTrail: [
      ...order.auditTrail,
      {
        id: `audit-${Date.now()}`,
        action: 'Orden aceptada — en preparación',
        timestamp: new Date().toISOString(),
      },
    ],
  }

  return { order: nextOrder, plantTables: nextPlant, success: true }
}

export function confirmRecipeForOrder(
  order: BacklogOrder,
  plantTables: PlantTable[],
  actorName: string,
): { order: BacklogOrder; plantTables: PlantTable[] } {
  const ids = new Set(order.assignedTableIds)

  const nextPlant = plantTables.map((t) => {
    if (!ids.has(t.id)) return t
    return { ...t, status: 'occupied' as const }
  })

  const nextOrder: BacklogOrder = {
    ...order,
    column: 'en_produccion',
    productionState: 'producing',
    preparationStatus: undefined,
    tablesValidated: true,
    validationTables: order.validationTables.map((vt) => ({ ...vt, status: 'validada' as const })),
    auditTrail: [
      ...order.auditTrail,
      {
        id: `audit-${Date.now()}`,
        action: 'Receta confirmada — en producción',
        timestamp: new Date().toISOString(),
        user: actorName,
      },
    ],
  }

  return { order: nextOrder, plantTables: nextPlant }
}
