import type { Company } from './auth'

export type GeneralStatus = 'ok' | 'warning' | 'critical'

export type DashboardOrderStatus =
  | 'pending'
  | 'active'
  | 'finishing'
  | 'validation'
  | 'delayed'

export interface DashboardKpis {
  availableCapacity: number
  occupiedTables: number
  totalTables: number
  activeOrders: number
  pendingOrders: number
  upcomingReleases: number
}

export interface DashboardOrder {
  id: string
  status: DashboardOrderStatus
  company: Extract<Company, 'SUMO' | 'MAF'>
  reference: string
  product: string
  variety: string
  boxes: number
  boxesPerHour: number
  eta: string
  estimatedEnd: string
  assignedTables: string[]
  alerts: string[]
}

export interface ActiveProductionItem {
  id: string
  reference: string
  company: Extract<Company, 'SUMO' | 'MAF'>
  product: string
  remainingMinutes: number
  occupiedTables: string[]
  alert?: string
}

export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface DashboardAlert {
  id: string
  severity: AlertSeverity
  message: string
  time: string
}

export type TableState = 'idle' | 'sumo' | 'maf' | 'mixed' | 'warning'
export type PalletizerState = 'idle' | 'sumo' | 'maf' | 'conflict'

export interface PlantTable {
  id: string
  label: string
  state: TableState
  pace: 'slow' | 'normal' | 'fast' | null
}

export interface PlantPalletizer {
  id: string
  label: string
  state: PalletizerState
}

export interface DashboardSnapshot {
  generalStatus: GeneralStatus
  kpis: DashboardKpis
  todayOrders: DashboardOrder[]
  activeProduction: ActiveProductionItem[]
  alerts: DashboardAlert[]
  tables: PlantTable[]
  palletizers: PlantPalletizer[]
}
