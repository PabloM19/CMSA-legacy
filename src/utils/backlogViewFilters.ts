import type { User } from '../types/auth'
import type { BacklogOrder } from '../types/backlog'
import { canActOnOrder } from './dashboardPermissions'

const ATTENTION_PATTERN =
  /incidencia|conflicto|crític|critico|retraso|bloqueo|finaliz|próximo|proximo|validaci/i

export function orderNeedsAttention(order: BacklogOrder): boolean {
  if (order.column === 'bloqueado') return true

  if (order.column === 'pendiente_validacion' && !order.tablesValidated) return true

  if (order.validationTables.some((t) => t.status === 'conflicto')) return true

  if (order.alerts.some((a) => ATTENTION_PATTERN.test(a))) return true

  if (
    order.column === 'en_ejecucion' &&
    order.alerts.some((a) => /finaliz|próximo|proximo/i.test(a))
  ) {
    return true
  }

  return false
}

export function filterAttentionOrders(orders: BacklogOrder[]): BacklogOrder[] {
  return orders.filter(orderNeedsAttention)
}

export function filterMineOrders(orders: BacklogOrder[], user: User): BacklogOrder[] {
  if (user.role === 'master') return orders

  if (user.role === 'validator') {
    return orders.filter((o) => o.column === 'pendiente_validacion')
  }

  if (user.role === 'user') {
    if (user.company === 'SUMO' || user.company === 'MAF') {
      return orders.filter((o) => o.company === user.company)
    }
  }

  return orders.filter((o) => canActOnOrder(user, o.company))
}

export function filterOrdersForView(
  orders: BacklogOrder[],
  viewMode: 'summary' | 'full' | 'attention' | 'mine',
  user: User | null,
): BacklogOrder[] {
  if (!user) return orders
  if (viewMode === 'attention') return filterAttentionOrders(orders)
  if (viewMode === 'mine') return filterMineOrders(orders, user)
  return orders
}
