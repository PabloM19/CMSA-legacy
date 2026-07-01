import type { Lang } from '../i18n/translations'
import type { BacklogColumnId, BacklogOrder } from '../types/backlog'
import type { PlantTable } from '../types/plant'
import type { User } from '../types/auth'
import { logOrderColumnMove } from './activityLogActions'
import { applyColumnMove } from './backlogRules'
import { confirmRecipeForOrder } from './preparationHelpers'
import { occupyOrderTables, releaseTablesForOrder } from './plantSync'

export function executeColumnMove(
  orders: BacklogOrder[],
  plantTables: PlantTable[],
  order: BacklogOrder,
  targetColumn: BacklogColumnId,
  actor: User,
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

  const releasesOnLeave = ['en_preparacion', 'en_produccion']
  if (
    order.column !== targetColumn &&
    releasesOnLeave.includes(order.column) &&
    targetColumn !== 'en_produccion'
  ) {
    workingPlant = releaseTablesForOrder(order.id, workingPlant)
    workingOrder = {
      ...workingOrder,
      assignedTableIds: [],
      assignedTables: [],
      assignmentMode: 'none',
      validationTables: [],
      tablesValidated: false,
      preparationStatus: undefined,
      productionState: undefined,
    }
  }

  if (targetColumn === 'en_produccion' && order.column === 'en_preparacion') {
    const confirmed = confirmRecipeForOrder(workingOrder, workingPlant, actor.name)
    workingOrder = confirmed.order
    workingPlant = confirmed.plantTables
    workingPlant = occupyOrderTables(workingOrder.id, workingPlant)
  } else {
    const moved = applyColumnMove(workingOrder, targetColumn, actor.name)
    workingOrder = moved

    if (targetColumn === 'finalizado') {
      workingPlant = releaseTablesForOrder(order.id, workingPlant)
    }
  }

  const nextOrders = orders.map((o) => (o.id === order.id ? workingOrder : o))

  if (order.column !== targetColumn) {
    logOrderColumnMove(actor, workingOrder.reference, order.column, targetColumn, lang)
  }

  return {
    success: true,
    orders: nextOrders,
    plantTables: workingPlant,
    movedOrder: workingOrder,
  }
}
