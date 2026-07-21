export interface PerformanceSummaryMock {
  globalEfficiency: number
  cpk: number
  assignedPercent: number
  completedPercent: number
  vsPreviousDay: number
  todayProduction: number
  yesterdayProduction: number
}

export interface StationPerformanceRow {
  id: string
  name: string
  type: 'robot' | 'manual' | 'palletizer'
  company: 'SUMO' | 'MAF' | null
  /** Dato secundario — ya no es métrica principal en la UI. */
  occupancyPercent: number
  ordersProcessed: number
  events: number
  efficiency: number
  vsYesterday: number
  /** Producción estimada actual (cajas/h). */
  currentBoxesPerHour: number
  /** Capacidad máxima estimada (cajas/h). */
  maxBoxesPerHour: number
  status: 'producing' | 'waiting' | 'blocked' | 'idle'
  associatedOrders?: string[]
}

export {
  DEMO_PERFORMANCE_SUMMARY as MOCK_PERFORMANCE_SUMMARY,
  DEMO_STATION_PERFORMANCE as MOCK_STATION_PERFORMANCE,
} from './demoScenario'

import { DEMO_STATION_PERFORMANCE } from './demoScenario'

export function findStationPerformance(id: string): StationPerformanceRow | undefined {
  return DEMO_STATION_PERFORMANCE.find((s) => s.id === id)
}
