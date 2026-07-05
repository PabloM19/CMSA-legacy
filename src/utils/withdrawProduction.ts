import type { BacklogOrder } from '../types/backlog'
import type { PlantTable } from '../types/plant'
import { releaseTablesForOrder } from './plantSync'

export type WithdrawReason =
  | 'incident'
  | 'reference_error'
  | 'supervisor_decision'
  | 'other'

function auditEntry(action: string, user: string): BacklogOrder['auditTrail'][0] {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    timestamp: new Date().toISOString(),
    user,
  }
}

export function withdrawOrderFromProduction(
  orders: BacklogOrder[],
  plantTables: PlantTable[],
  orderId: string,
  reasonLabel: string,
  actorName: string,
  boxesProduced = 0,
): { orders: BacklogOrder[]; plantTables: PlantTable[] } {
  const nextOrders = orders.map((order) => {
    if (order.id !== orderId) return order
    return {
      ...order,
      column: 'finalizado' as const,
      productionState: 'withdrawn' as const,
      boxesProduced: boxesProduced > 0 ? boxesProduced : order.boxesProduced,
      alerts: [...order.alerts.filter((a) => !a.startsWith('Retirado')), `Retirado: ${reasonLabel}`],
      auditTrail: [...order.auditTrail, auditEntry('Orden retirada de producción', actorName)],
    }
  })
  const nextPlant = releaseTablesForOrder(orderId, plantTables)
  return { orders: nextOrders, plantTables: nextPlant }
}
