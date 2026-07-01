import type { Company, UserRole } from './auth'
import type { OrderCompany } from './newOrder'
import type { PlantPalletizerStatus, PlantTableStatus, PlantTableType } from './plant'

export type AdminUserStatus = 'activo' | 'inactivo'
export type AdminCompanyStatus = 'activa' | 'inactiva'

export interface AdminUser {
  id: string
  name: string
  username: string
  role: UserRole
  company: Company
  status: AdminUserStatus
  lastAccessMock: string
}

export interface AdminCompany {
  id: string
  name: string
  color: string
  assignedCapacity: number
  status: AdminCompanyStatus
}

export interface AdminTableMeta {
  capacity: number
  active: boolean
}

export interface AdminPalletizerMeta {
  capacity: number
  active: boolean
}

export interface AdminTableRow {
  id: string
  name: string
  type: PlantTableType
  status: PlantTableStatus
  company: OrderCompany | null
  orderId: string | null
  orderReference: string | null
  capacity: number
  active: boolean
}

export interface AdminPalletizerRow {
  id: string
  name: string
  status: PlantPalletizerStatus
  capacity: number
  alert: string | null
  active: boolean
}

export interface ProductionConfig {
  minBoxesPerHour: number
  maxBoxesPerHour: number
  boxesPerLayer: number
  layersPerPallet: number
  overloadThreshold: number
  finishingSoonMinutes: number
  allowManualTables: boolean
  sumoCapacity: number
  mafCapacity: number
}

export type AuditEntity =
  | 'usuario'
  | 'empresa'
  | 'mesa'
  | 'paletizador'
  | 'configuracion'
  | 'pedido'
  | 'validacion'
  | 'autenticacion'
  | 'tablet'
  | 'sistema'

export type AuditFilter =
  | 'all'
  | 'usuario'
  | 'empresa'
  | 'mesa'
  | 'paletizador'
  | 'configuracion'
  | 'pedido'
  | 'validacion'
  | 'autenticacion'
  | 'tablet'
  | 'sistema'

export interface AuditEvent {
  id: string
  timestamp: string
  username: string
  role: UserRole
  action: string
  entity: AuditEntity
  detail: string
}

export interface AdminPersistedData {
  users: AdminUser[]
  companies: AdminCompany[]
  tableMeta: Record<string, AdminTableMeta>
  palletizerMeta: Record<string, AdminPalletizerMeta>
  productionConfig: ProductionConfig
  auditLog: AuditEvent[]
}

export type AdminTabId =
  | 'users'
  | 'companies'
  | 'references'
  | 'tables'
  | 'palletizers'
  | 'alarms'
  | 'activity'
  | 'config'
  | 'audit'
