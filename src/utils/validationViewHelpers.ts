import type { BacklogOrder } from '../types/backlog'
import type { ValidationKpiCounts } from '../types/validation'
import {
  canStartProduction,
  getTableStats,
  hasTableConflicts,
} from './validationHelpers'

export type ValidationFilter = 'all' | 'pending' | 'conflict' | 'ready'
export type ValidationHeroStatus = 'pending' | 'ready' | 'conflict'

export function getValidationHeroStatus(kpis: ValidationKpiCounts): ValidationHeroStatus {
  if (kpis.activeConflicts > 0) return 'conflict'
  if (kpis.pendingTables > 0) return 'pending'
  return 'ready'
}

export function getValidationHeroMessageKey(
  status: ValidationHeroStatus,
): 'heroPending' | 'heroReady' | 'heroConflict' {
  if (status === 'conflict') return 'heroConflict'
  if (status === 'pending') return 'heroPending'
  return 'heroReady'
}

export function filterValidationOrders(
  orders: BacklogOrder[],
  filter: ValidationFilter,
): BacklogOrder[] {
  switch (filter) {
    case 'pending':
      return orders.filter((o) => getTableStats(o).pending > 0)
    case 'conflict':
      return orders.filter(hasTableConflicts)
    case 'ready':
      return orders.filter(canStartProduction)
    default:
      return orders
  }
}

export function mapHeroStatusToDashClass(status: ValidationHeroStatus): 'ok' | 'warning' | 'critical' {
  if (status === 'conflict') return 'critical'
  if (status === 'pending') return 'warning'
  return 'ok'
}
