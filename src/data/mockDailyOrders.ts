import type { DailyOrder } from '../types/dailyOrder'
import { buildSyncedDailyOrders } from '../utils/dailyOrderHelpers'
import {
  DEMO_DAILY_ORDERS_TOTAL,
  DEMO_DAILY_ORDER_TEMPLATES,
  DEMO_PRODUCTION_ORDERS,
} from './demoScenario'

/** @deprecated Usar DEMO_DAILY_ORDER_TEMPLATES desde demoScenario */
export const mockDailyOrders: DailyOrder[] = DEMO_DAILY_ORDER_TEMPLATES

export { DEMO_DAILY_ORDERS_TOTAL }

export function findDailyOrder(id: string): DailyOrder | undefined {
  return buildSyncedDailyOrders(DEMO_PRODUCTION_ORDERS).find((d) => d.id === id)
}
