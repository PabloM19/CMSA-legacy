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
  | 'withdrawn'

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
  /** Pedido del día origen (orden de producción parcial). */
  pedidoDiaId?: string
  estilo?: string
  barcode?: string
  company: OrderCompany
  reference: string
  productId?: string
  productReference?: string
  productName?: string
  product: string
  variety: string
  boxes: number
  /** Cajas ya producidas (mock) — p. ej. al retirar parcialmente. */
  boxesProduced?: number
  boxesPerHour: number
  column: BacklogColumnId
  preparationStatus?: PreparationStatus
  productionState?: ProductionVisualState
  /** Estimated Time of Completion (visible como ETC). */
  etc: string
  /** @deprecated Usar etc — se mantiene por migración localStorage. */
  eta?: string
  endTime: string
  occupancyPercent?: number
  createdBy?: string
  createdAt?: string
  events?: string[]
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
