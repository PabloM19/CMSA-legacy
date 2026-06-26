import type { OrderCompany } from './newOrder'

export type BacklogColumnId =
  | 'en_backlog'
  | 'pendiente_lanzamiento'
  | 'pendiente_validacion'
  | 'en_ejecucion'
  | 'bloqueado'
  | 'finalizado'

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
  product: string
  variety: string
  boxes: number
  boxesPerHour: number
  column: BacklogColumnId
  eta: string
  endTime: string
  requiredTables: number
  assignedTables: string[]
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
