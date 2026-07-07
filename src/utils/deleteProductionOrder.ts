import type { BacklogOrder } from '../types/backlog'
import type { DailyOrder } from '../types/dailyOrder'
import type { PlantTable } from '../types/plant'
import { appendDailyOrderEvent, syncAllDailyOrders } from './dailyOrderHelpers'
import { releaseTablesForOrder } from './plantSync'
import { normalizePriorities } from './backlogStorage'

export type DeleteProductionReason =
  | 'incident'
  | 'reference_error'
  | 'supervisor_decision'
  | 'other'

export function deleteProductionOrder(
  orders: BacklogOrder[],
  plantTables: PlantTable[],
  dailyOrders: DailyOrder[],
  orderId: string,
  reasonLabel: string,
  actorName: string,
): { orders: BacklogOrder[]; plantTables: PlantTable[]; dailyOrders: DailyOrder[] } {
  const order = orders.find((o) => o.id === orderId)
  if (!order) {
    return { orders, plantTables, dailyOrders }
  }

  const nextOrders = normalizePriorities(orders.filter((o) => o.id !== orderId))
  const nextPlant = releaseTablesForOrder(orderId, plantTables)

  let nextDaily = dailyOrders
  if (order.pedidoDiaId) {
    const detail = [
      order.reference,
      `${order.boxes.toLocaleString('es-ES')} cajas`,
      reasonLabel,
    ].join(' · ')

    nextDaily = dailyOrders.map((d) => {
      if (d.id !== order.pedidoDiaId) return d
      return appendDailyOrderEvent(d, 'Orden de producción eliminada', actorName, detail)
    })
    nextDaily = syncAllDailyOrders(nextDaily, nextOrders)
  }

  return { orders: nextOrders, plantTables: nextPlant, dailyOrders: nextDaily }
}
