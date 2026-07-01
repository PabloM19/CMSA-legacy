import type { OrderCompany } from './newOrder'
import type { AssignmentMode } from './plant'

/** Columnas principales del tablero (3 + acabados como sección). */
export type BacklogColumnId =
  | 'en_backlog'
  | 'en_preparacion'
  | 'en_produccion'
  | 'finalizado'

/** @deprecated IDs legacy — migrados al cargar desde localStorage */
export type LegacyBacklogColumnId =
  | 'pendiente_lanzamiento'
  | 'pendiente_validacion'
  | 'en_ejecucion'
  | 'bloqueado'

export type PreparationStatus =
  | 'pending_preparation'
  | 'waiting_cell'
  | 'preparing_recipe'

export type ProductionVisualState =
  | 'producing'
  | 'temp_waiting'
  | 'temp_blocked'
  | 'element_blocked'
  | 'completed'

export type ValidationTableStatus = 'pendiente' | 'validada' | 'conflicto' | 'parada'
export type ValidationTableType = 'automatic' | 'manual'

export interface ValidationTable {
  id: string
  plantTableId: string
  name: string
  type: ValidationTableType
  status: ValidationTableStatus
  company: OrderCompany
  orderId: string
  orderReference: string
  conflictReason?: string
}

export interface AuditEntry {
  id: string
  action: string
  timestamp: string
  user?: string
}

export interface BacklogOrder {
  id: string
  company: OrderCompany
  reference: string
  productId?: string
  productReference?: string
  productName?: string
  product: string
  variety: string
  boxes: number
  boxesPerHour: number
  column: BacklogColumnId
  preparationStatus?: PreparationStatus
  productionState?: ProductionVisualState
  eta: string
  endTime: string
  requiredTables: number
  assignedTableIds: string[]
  assignedTables: string[]
  assignmentMode: AssignmentMode
  requiresManualTables?: boolean
  validationTables: ValidationTable[]
  tablesValidated: boolean
  alerts: string[]
  priority: number
  auditTrail: AuditEntry[]
}

export interface BacklogKpiCounts {
  total: number
  inQueue: number
  inBacklog: number
  inPreparation: number
  inProduction: number
  completed: number
}
