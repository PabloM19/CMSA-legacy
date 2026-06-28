import type { OrderCompany } from './newOrder'

export type BacklogColumnId =
  | 'en_backlog'
  | 'pendiente_lanzamiento'
  | 'pendiente_validacion'
  | 'en_ejecucion'
  | 'bloqueado'
  | 'finalizado'

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

import type { AssignmentMode } from './plant'

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
  eta: string
  endTime: string
  /** Mesas necesarias para el pedido. */
  requiredTables: number
  /** IDs de mesas asignadas: R1, M4… */
  assignedTableIds: string[]
  /** Alias visible de mesas asignadas (mismos IDs). */
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
  pendingLaunch: number
  pendingValidation: number
  inExecution: number
  blocked: number
  completed: number
}
