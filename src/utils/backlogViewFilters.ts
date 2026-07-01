import type { User } from '../types/auth'
import type { BacklogOrder } from '../types/backlog'
import { canActOnOrder } from './dashboardPermissions'

const ATTENTION_PATTERN =
  /incidencia|conflicto|crític|critico|retraso|bloqueo|finaliz|próximo|proximo|espera/i

export function orderNeedsAttention(order: BacklogOrder): boolean {
  if (order.column === 'en_produccion' && order.productionState === 'temp_blocked') return true
  if (order.column === 'en_produccion' && order.productionState === 'element_blocked') return true
  if (order.column === 'en_preparacion' && order.preparationStatus === 'waiting_cell') return true
  if (order.validationTables.some((t) => t.status === 'conflicto')) return true
  if (order.alerts.some((a) => ATTENTION_PATTERN.test(a))) return true
  return false
}

export function filterInProgressOrders(orders: BacklogOrder[]): BacklogOrder[] {
  return orders.filter(
    (o) =>
      o.column === 'en_backlog' ||
      o.column === 'en_preparacion' ||
      o.column === 'en_produccion',
  )
}

export function filterCompletedOrders(orders: BacklogOrder[]): BacklogOrder[] {
  return orders.filter((o) => o.column === 'finalizado')
}

export function filterMineOrders(orders: BacklogOrder[], user: User): BacklogOrder[] {
  if (user.role === 'superadmin' || user.role === 'supervisor') return orders

  if (user.role === 'user') {
    if (user.company === 'SUMO' || user.company === 'MAF') {
      return orders.filter((o) => o.company === user.company)
    }
  }

  return orders.filter((o) => canActOnOrder(user, o.company))
}

export function filterOrdersForView(
  orders: BacklogOrder[],
  viewMode: 'summary' | 'full' | 'in_progress' | 'completed',
  user: User | null,
): BacklogOrder[] {
  if (!user) return orders
  if (viewMode === 'in_progress') {
    return filterInProgressOrders(filterMineOrders(orders, user))
  }
  if (viewMode === 'completed') {
    return filterCompletedOrders(orders)
  }
  return orders
}
