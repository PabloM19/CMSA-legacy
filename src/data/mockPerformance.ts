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
  occupancyPercent: number
  ordersProcessed: number
  events: number
  efficiency: number
  vsYesterday: number
}

export const MOCK_PERFORMANCE_SUMMARY: PerformanceSummaryMock = {
  globalEfficiency: 87,
  cpk: 1.34,
  assignedPercent: 64,
  completedPercent: 42,
  vsPreviousDay: 6,
  todayProduction: 73_040,
  yesterdayProduction: 68_920,
}

export const MOCK_STATION_PERFORMANCE: StationPerformanceRow[] = [
  {
    id: 'R1',
    name: 'R1',
    type: 'robot',
    company: 'SUMO',
    occupancyPercent: 82,
    ordersProcessed: 3,
    events: 1,
    efficiency: 91,
    vsYesterday: 4,
  },
  {
    id: 'R2',
    name: 'R2',
    type: 'robot',
    company: 'SUMO',
    occupancyPercent: 78,
    ordersProcessed: 2,
    events: 0,
    efficiency: 88,
    vsYesterday: 2,
  },
  {
    id: 'R3',
    name: 'R3',
    type: 'robot',
    company: 'SUMO',
    occupancyPercent: 65,
    ordersProcessed: 1,
    events: 1,
    efficiency: 84,
    vsYesterday: -1,
  },
  {
    id: 'R4',
    name: 'R4',
    type: 'robot',
    company: 'SUMO',
    occupancyPercent: 69,
    ordersProcessed: 2,
    events: 1,
    efficiency: 86,
    vsYesterday: 5,
  },
  {
    id: 'R5',
    name: 'R5',
    type: 'robot',
    company: 'MAF',
    occupancyPercent: 71,
    ordersProcessed: 2,
    events: 0,
    efficiency: 85,
    vsYesterday: 3,
  },
  {
    id: 'R6',
    name: 'R6',
    type: 'robot',
    company: 'MAF',
    occupancyPercent: 58,
    ordersProcessed: 1,
    events: 1,
    efficiency: 79,
    vsYesterday: -2,
  },
  {
    id: 'M2',
    name: 'M2',
    type: 'manual',
    company: 'SUMO',
    occupancyPercent: 74,
    ordersProcessed: 2,
    events: 1,
    efficiency: 83,
    vsYesterday: 1,
  },
  {
    id: 'M4',
    name: 'M4',
    type: 'manual',
    company: 'MAF',
    occupancyPercent: 67,
    ordersProcessed: 1,
    events: 0,
    efficiency: 80,
    vsYesterday: 0,
  },
  {
    id: 'M6',
    name: 'M6',
    type: 'manual',
    company: 'MAF',
    occupancyPercent: 62,
    ordersProcessed: 1,
    events: 0,
    efficiency: 77,
    vsYesterday: -3,
  },
  {
    id: 'P3',
    name: 'P3',
    type: 'palletizer',
    company: 'SUMO',
    occupancyPercent: 55,
    ordersProcessed: 4,
    events: 0,
    efficiency: 92,
    vsYesterday: 6,
  },
  {
    id: 'P5',
    name: 'P5',
    type: 'palletizer',
    company: 'MAF',
    occupancyPercent: 48,
    ordersProcessed: 3,
    events: 0,
    efficiency: 89,
    vsYesterday: 2,
  },
]

export function findStationPerformance(id: string): StationPerformanceRow | undefined {
  return MOCK_STATION_PERFORMANCE.find((s) => s.id === id)
}
