import type { BacklogOrder } from '../types/backlog'
import type { CreatedOrder } from '../types/newOrder'
import type { ValidationTable } from '../types/backlog'
import type { DailyOrdersSummaryStats } from '../types/dailyOrder'
import {
  DEMO_DAILY_ORDERS_TOTAL,
  DEMO_PRODUCTION_ORDERS,
} from './demoScenario'
import { buildSyncedDailyOrders, computeDailyOrdersSummary } from '../utils/dailyOrderHelpers'

function audit(action: string, user = 'Sistema'): BacklogOrder['auditTrail'][0] {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    timestamp: new Date().toISOString(),
    user,
  }
}

const emptyAssignment = {
  assignedTableIds: [] as string[],
  assignedTables: [] as string[],
  assignmentMode: 'none' as const,
  validationTables: [] as ValidationTable[],
}

/** Órdenes de producción mock — escenario demo centralizado. */
export const mockProductionOrders: BacklogOrder[] = DEMO_PRODUCTION_ORDERS

/** @deprecated Usar mockProductionOrders */
export const mockBacklogOrders = mockProductionOrders

export function getSeedDailyOrders() {
  return buildSyncedDailyOrders(mockProductionOrders)
}

export function convertCreatedOrder(order: CreatedOrder, pedidoDiaId?: string): BacklogOrder {
  return {
    id: order.id,
    pedidoDiaId,
    company: order.company,
    reference: order.reference,
    productId: order.productId,
    productReference: order.productReference,
    productName: order.productName,
    product: order.product,
    variety: order.variety,
    boxes: order.boxes,
    boxesPerHour: order.boxesPerHour,
    column: 'en_preparacion',
    preparationStatus: 'pending_preparation',
    etc: order.calculation.etc ?? order.calculation.eta ?? '—',
    endTime: order.calculation.estimatedEnd,
    requiredTables: Math.max(2, order.calculation.requiredTables),
    ...emptyAssignment,
    tablesValidated: false,
    alerts: order.calculation.alerts.map((a) => a.message),
    requiresManualTables: order.calculation.alerts.some((a) =>
      /sobrecarga|overload|manual/i.test(a.message),
    ),
    priority: 0,
    auditTrail: [audit('Orden de producción creada'), audit('Pendiente de aceptación')],
  }
}

export function computeKpis(orders: BacklogOrder[]) {
  const pending = orders.filter(
    (o) => o.column === 'en_backlog' || o.column === 'en_preparacion',
  ).length
  const inPreparation = orders.filter((o) => o.column === 'en_preparacion').length

  return {
    total: orders.length,
    inQueue: pending,
    inBacklog: orders.filter((o) => o.column === 'en_backlog').length,
    inPreparation,
    inProduction: orders.filter((o) => o.column === 'en_produccion').length,
    completed: orders.filter((o) => o.column === 'finalizado').length,
  }
}

export function computeDailySummaryFromState(
  dailyOrders: ReturnType<typeof getSeedDailyOrders>,
  productionOrders: BacklogOrder[],
): DailyOrdersSummaryStats {
  return computeDailyOrdersSummary(dailyOrders, productionOrders)
}

export { DEMO_DAILY_ORDERS_TOTAL }
