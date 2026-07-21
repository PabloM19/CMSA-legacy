import type { OrderCompany } from './newOrder'
import type { BacklogOrder } from './backlog'

export type PlantTableType = 'automatic' | 'manual'
export type PlantTableStatus =
  | 'free'
  | 'validated'
  | 'occupied'
  | 'waiting'
  | 'blocked'
  | 'conflict'

export type PlantSpeedStatus = 'slow' | 'normal' | 'fast' | null
export type AssignmentMode = 'automatic' | 'mixed' | 'manual' | 'none'

export interface PlantTable {
  id: string
  name: string
  type: PlantTableType
  status: PlantTableStatus
  company: OrderCompany | null
  orderId: string | null
  speedStatus: PlantSpeedStatus
  alert: string | null
}

export type PlantElementType = 'automatic' | 'manual' | 'palletizer'

export type PlantPalletizerStatus =
  | 'free'
  | 'active'
  | 'idle'
  | 'waiting'
  | 'blocked'
  | 'conflict'

export interface PlantPalletizerElement {
  id: string
  name: string
  type: 'palletizer'
  status: PlantPalletizerStatus
  company: OrderCompany | null
  orderId: string | null
  alert: string | null
}

export interface PlantElementView {
  id: string
  name: string
  type: PlantElementType
  status: PlantTableStatus | PlantPalletizerStatus
  company: OrderCompany | null
  orderId: string | null
  orderReference: string | null
  product: string | null
  variety: string | null
  boxes: number | null
  boxesPerHour: number | null
  eta: string | null
  endTime: string | null
  remainingTime: string | null
  speedStatus: PlantSpeedStatus
  occupancyPercent: number | null
  alert: string | null
  isClickable: boolean
  /** Mesa/celda desactivada desde administración. */
  isDisabled?: boolean
  /** Situación crítica mock (high runner / alto volumen). */
  isCritical?: boolean
}

export interface CmsaPersistedState {
  scenarioVersion?: string
  dailyOrders: import('./dailyOrder').DailyOrder[]
  orders: BacklogOrder[]
  plantTables: PlantTable[]
  plantPalletizers: PlantPalletizerElement[]
}

/** @deprecated Usado por dashboard mock legacy */
export interface PlantZone {
  id: string
  name: string
  status: 'active' | 'idle' | 'maintenance'
  capacity: number
  occupied: number
}

export type PalletizerStatus = 'active' | 'idle' | 'maintenance'

export interface Palletizer {
  id: string
  name: string
  status: PalletizerStatus
}
