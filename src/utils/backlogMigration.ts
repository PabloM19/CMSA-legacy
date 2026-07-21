import type { BacklogColumnId, BacklogOrder, PreparationStatus, ProductionVisualState } from '../types/backlog'
import { recommendedStationCodes } from './productionOrderValidation'
import { isPlantTableId } from './tableAssignment'

const LEGACY_COLUMNS = new Set<string>([
  'pendiente_lanzamiento',
  'pendiente_validacion',
  'en_ejecucion',
  'bloqueado',
])

export function migrateBacklogOrder(order: BacklogOrder): BacklogOrder {
  const rawColumn = order.column as string
  let column: BacklogColumnId = order.column
  let preparationStatus: PreparationStatus | undefined = order.preparationStatus
  let productionState: ProductionVisualState | undefined = order.productionState

  if (rawColumn === 'pendiente_lanzamiento') {
    column = 'en_preparacion'
    preparationStatus = preparationStatus ?? 'pending_preparation'
  } else if (rawColumn === 'pendiente_validacion') {
    column = 'en_preparacion'
    preparationStatus = preparationStatus ?? 'waiting_cell'
  } else if (rawColumn === 'en_ejecucion') {
    column = 'en_produccion'
    productionState = productionState ?? 'producing'
  } else if (rawColumn === 'bloqueado') {
    column = 'en_produccion'
    productionState = productionState ?? 'temp_blocked'
  } else if (column === 'finalizado') {
    productionState = 'completed'
  }

  const hasAssigned =
    (order.assignedTableIds?.length ?? 0) > 0 || (order.assignedTables?.length ?? 0) > 0
  const stationCodes = hasAssigned
    ? []
    : recommendedStationCodes(order.boxes).map((station) => station.code)

  return {
    ...order,
    column,
    preparationStatus,
    productionState,
    etc: order.etc ?? order.eta ?? '—',
    eta: order.eta ?? order.etc,
    requiredTables: Math.max(2, order.requiredTables),
    ...(stationCodes.length > 0
      ? {
          assignedTables: stationCodes,
          assignedTableIds: stationCodes.filter(isPlantTableId),
          assignmentMode: 'automatic' as const,
        }
      : {}),
  }
}

export function migrateBacklogOrders(orders: BacklogOrder[]): BacklogOrder[] {
  return orders.map(migrateBacklogOrder)
}

export function isLegacyColumn(column: string): boolean {
  return LEGACY_COLUMNS.has(column)
}
