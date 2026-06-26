import type { OrderCompany } from './newOrder'
import type { BacklogOrder } from './backlog'

export type PlantTableType = 'automatic' | 'manual'
export type PlantTableStatus =
  | 'free'
  | 'reserved'
  | 'pending_validation'
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

export interface CmsaPersistedState {
  orders: BacklogOrder[]
  plantTables: PlantTable[]
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
