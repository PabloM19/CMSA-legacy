import type { Lang } from '../i18n/translations'
import type { BacklogColumnId, BacklogOrder } from '../types/backlog'
import type { PlantTable } from '../types/plant'
import { applyColumnMove } from './backlogRules'
import { occupyOrderTables, releaseTablesForOrder, syncPlantFromValidationTables } from './plantSync'
import { assignTablesToOrder } from './tableAssignment'

export function executeColumnMove(
  orders: BacklogOrder[],
  plantTables: PlantTable[],
  order: BacklogOrder,
  targetColumn: BacklogColumnId,
  userName: string,
  lang: Lang,
): {
  success: boolean
  orders: BacklogOrder[]
  plantTables: PlantTable[]
  movedOrder?: BacklogOrder
  message?: string
} {
  let workingOrder = order
  let workingPlant = plantTables

  const releasesOnLeave = ['pendiente_validacion', 'en_ejecucion', 'bloqueado']
  if (
    order.column !== targetColumn &&
    releasesOnLeave.includes(order.column) &&
    targetColumn !== 'en_ejecucion'
  ) {
    workingPlant = releaseTablesForOrder(order.id, workingPlant)
    workingOrder = {
      ...workingOrder,
      assignedTableIds: [],
      assignedTables: [],
      assignmentMode: 'none',
      validationTables: [],
      tablesValidated: false,
    }
  }

  if (targetColumn === 'pendiente_validacion' && order.column !== 'pendiente_validacion') {
    const assignment = assignTablesToOrder(workingOrder, workingPlant, lang)
    if (!assignment.success) {
      return {
        success: false,
        orders,
        plantTables,
        message: assignment.message,
      }
    }
    workingOrder = assignment.order
    workingPlant = assignment.plantTables
  }

  const moved = applyColumnMove(workingOrder, targetColumn, userName)

  if (targetColumn === 'en_ejecucion') {
    workingPlant = syncPlantFromValidationTables(workingPlant, moved)
    workingPlant = occupyOrderTables(moved.id, workingPlant)
  }

  const nextOrders = orders.map((o) => (o.id === order.id ? moved : o))

  return {
    success: true,
    orders: nextOrders,
    plantTables: workingPlant,
    movedOrder: moved,
  }
}
