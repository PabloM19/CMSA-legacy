import { mockCredentials } from '../data/mockUsers'
import { createSeedPalletizers, createSeedPlantTables } from '../data/mockPlantTables'
import type {
  AdminCompany,
  AdminPalletizerMeta,
  AdminPalletizerRow,
  AdminPersistedData,
  AdminTableMeta,
  AdminTableRow,
  AdminUser,
  AuditEntity,
  AuditEvent,
  ProductionConfig,
} from '../types/admin'
import type { User } from '../types/auth'
import type { OrderCompany } from '../types/newOrder'
import type { PlantPalletizerElement, PlantTable, PlantTableStatus, PlantTableType } from '../types/plant'
import { getState, saveState } from './backlogStorage'
import { setAdminPlantOverride } from './adminPlantOverrides'

export const ADMIN_STORAGE_KEY = 'cmsa-admin-data'

const DEFAULT_CONFIG: ProductionConfig = {
  minBoxesPerHour: 100,
  maxBoxesPerHour: 800,
  boxesPerLayer: 8,
  layersPerPallet: 10,
  overloadThreshold: 5000,
  finishingSoonMinutes: 30,
  allowManualTables: true,
  sumoCapacity: 72,
  mafCapacity: 48,
}

const DEFAULT_COMPANIES: AdminCompany[] = [
  { id: 'sumo', name: 'SUMO', color: '#6D28D9', assignedCapacity: 72, status: 'activa' },
  { id: 'maf', name: 'MAF', color: '#F97316', assignedCapacity: 48, status: 'activa' },
]

function nowIso(): string {
  return new Date().toISOString()
}

function mockLastAccess(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function seedUsers(): AdminUser[] {
  return mockCredentials.map((cred, index) => ({
    id: cred.user.id,
    name: cred.user.name,
    username: cred.user.username,
    role: cred.user.role,
    company: cred.user.company,
    status: 'activo' as const,
    lastAccessMock: mockLastAccess(index),
  }))
}

function seedTableMeta(): Record<string, AdminTableMeta> {
  const meta: Record<string, AdminTableMeta> = {}
  createSeedPlantTables().forEach((t) => {
    meta[t.id] = { capacity: t.type === 'automatic' ? 1200 : 800, active: true }
  })
  return meta
}

function seedPalletizerMeta(): Record<string, AdminPalletizerMeta> {
  const meta: Record<string, AdminPalletizerMeta> = {}
  createSeedPalletizers().forEach((p) => {
    meta[p.id] = { capacity: 500, active: true }
  })
  return meta
}

function seedAdminData(): AdminPersistedData {
  return {
    users: seedUsers(),
    companies: [...DEFAULT_COMPANIES],
    tableMeta: seedTableMeta(),
    palletizerMeta: seedPalletizerMeta(),
    productionConfig: { ...DEFAULT_CONFIG },
    auditLog: [
      {
        id: 'audit-seed-1',
        timestamp: nowIso(),
        username: 'sistema',
        role: 'master',
        action: 'Inicialización admin',
        entity: 'sistema',
        detail: 'Datos mock de administración cargados',
      },
    ],
  }
}

function readAdminData(): AdminPersistedData | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AdminPersistedData
  } catch {
    return null
  }
}

function saveAdminData(data: AdminPersistedData): void {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data))
}

export function getAdminData(): AdminPersistedData {
  let data = readAdminData()
  if (!data) {
    data = seedAdminData()
    saveAdminData(data)
  }
  return data
}

export function getProductionConfig(): ProductionConfig {
  return { ...getAdminData().productionConfig }
}

export function getDefaultProductionConfig(): ProductionConfig {
  return { ...DEFAULT_CONFIG }
}

export function addAuditEvent(
  actor: User,
  action: string,
  entity: AuditEntity,
  detail: string,
): AuditEvent {
  const data = getAdminData()
  const event: AuditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: nowIso(),
    username: actor.username,
    role: actor.role,
    action,
    entity,
    detail,
  }
  data.auditLog = [event, ...data.auditLog].slice(0, 200)
  saveAdminData(data)
  return event
}

export function getAuditLog(): AuditEvent[] {
  return getAdminData().auditLog
}

/* ── Usuarios ── */

export function getAdminUsers(): AdminUser[] {
  return getAdminData().users
}

function countActiveMasters(users: AdminUser[]): number {
  return users.filter((u) => u.role === 'master' && u.status === 'activo').length
}

export function createAdminUser(
  actor: User,
  input: Omit<AdminUser, 'id' | 'lastAccessMock'>,
): { ok: true; user: AdminUser } | { ok: false; error: string } {
  if (!input.name.trim() || !input.username.trim() || !input.role || !input.company) {
    return { ok: false, error: 'missing_fields' }
  }

  const data = getAdminData()
  if (data.users.some((u) => u.username === input.username.trim())) {
    return { ok: false, error: 'duplicate_username' }
  }

  const user: AdminUser = {
    ...input,
    id: `u-${Date.now()}`,
    name: input.name.trim(),
    username: input.username.trim(),
    lastAccessMock: '—',
  }
  data.users = [...data.users, user]
  saveAdminData(data)
  addAuditEvent(actor, 'Usuario creado', 'usuario', `${user.username} (${user.role})`)
  return { ok: true, user }
}

export function updateAdminUser(
  actor: User,
  id: string,
  patch: Partial<Omit<AdminUser, 'id'>>,
): { ok: true; user: AdminUser } | { ok: false; error: string } {
  const data = getAdminData()
  const index = data.users.findIndex((u) => u.id === id)
  if (index < 0) return { ok: false, error: 'not_found' }

  const next = { ...data.users[index], ...patch }
  if (!next.name.trim() || !next.username.trim()) {
    return { ok: false, error: 'missing_fields' }
  }

  if (data.users.some((u) => u.id !== id && u.username === next.username.trim())) {
    return { ok: false, error: 'duplicate_username' }
  }

  data.users[index] = { ...next, name: next.name.trim(), username: next.username.trim() }
  saveAdminData(data)
  addAuditEvent(actor, 'Usuario editado', 'usuario', next.username)
  return { ok: true, user: data.users[index] }
}

export function toggleAdminUserStatus(
  actor: User,
  id: string,
): { ok: true; user: AdminUser } | { ok: false; error: string } {
  const data = getAdminData()
  const user = data.users.find((u) => u.id === id)
  if (!user) return { ok: false, error: 'not_found' }

  if (user.status === 'activo' && user.role === 'master') {
    const others = countActiveMasters(data.users.filter((u) => u.id !== id))
    if (others === 0) return { ok: false, error: 'last_master' }
  }

  user.status = user.status === 'activo' ? 'inactivo' : 'activo'
  saveAdminData(data)
  addAuditEvent(
    actor,
    user.status === 'inactivo' ? 'Usuario desactivado' : 'Usuario activado',
    'usuario',
    user.username,
  )
  return { ok: true, user }
}

/* ── Empresas ── */

export function getAdminCompanies(): AdminCompany[] {
  return getAdminData().companies
}

export function updateAdminCompany(
  actor: User,
  id: string,
  patch: Partial<Pick<AdminCompany, 'assignedCapacity' | 'color' | 'status'>>,
): { ok: true; company: AdminCompany } | { ok: false; error: string } {
  const data = getAdminData()
  const company = data.companies.find((c) => c.id === id)
  if (!company) return { ok: false, error: 'not_found' }

  if (patch.assignedCapacity != null) {
    if (patch.assignedCapacity < 0 || patch.assignedCapacity > 100) {
      return { ok: false, error: 'invalid_capacity' }
    }
    company.assignedCapacity = patch.assignedCapacity
  }
  if (patch.color) company.color = patch.color
  if (patch.status) company.status = patch.status

  saveAdminData(data)
  addAuditEvent(actor, 'Empresa editada', 'empresa', `${company.name} · ${company.assignedCapacity}%`)
  return { ok: true, company }
}

export function toggleAdminCompanyStatus(
  actor: User,
  id: string,
): { ok: true; company: AdminCompany } | { ok: false; error: string } {
  const data = getAdminData()
  const company = data.companies.find((c) => c.id === id)
  if (!company) return { ok: false, error: 'not_found' }

  company.status = company.status === 'activa' ? 'inactiva' : 'activa'
  saveAdminData(data)
  addAuditEvent(
    actor,
    company.status === 'inactiva' ? 'Empresa desactivada' : 'Empresa activada',
    'empresa',
    company.name,
  )
  return { ok: true, company }
}

export function createAdminCompany(
  actor: User,
  input: { name: string; color: string; assignedCapacity: number },
): { ok: true; company: AdminCompany } | { ok: false; error: string } {
  if (!input.name.trim()) return { ok: false, error: 'missing_fields' }
  if (input.assignedCapacity < 0 || input.assignedCapacity > 100) {
    return { ok: false, error: 'invalid_capacity' }
  }

  const data = getAdminData()
  const company: AdminCompany = {
    id: `co-${Date.now()}`,
    name: input.name.trim().toUpperCase(),
    color: input.color,
    assignedCapacity: input.assignedCapacity,
    status: 'activa',
  }
  data.companies = [...data.companies, company]
  saveAdminData(data)
  addAuditEvent(actor, 'Empresa creada', 'empresa', company.name)
  return { ok: true, company }
}

/* ── Mesas (sync backlog) ── */

function orderRef(orderId: string | null, orders: ReturnType<typeof getState>['orders']): string | null {
  if (!orderId) return null
  return orders.find((o) => o.id === orderId)?.reference ?? orderId
}

export function getAdminTables(): AdminTableRow[] {
  const data = getAdminData()
  const state = getState()
  return state.plantTables.map((table) => {
    const meta = data.tableMeta[table.id] ?? { capacity: 1000, active: true }
    return {
      id: table.id,
      name: table.name,
      type: table.type,
      status: table.status,
      company: table.company,
      orderId: table.orderId,
      orderReference: orderRef(table.orderId, state.orders),
      capacity: meta.capacity,
      active: meta.active,
    }
  })
}

function ensureTableMeta(data: AdminPersistedData, id: string): AdminTableMeta {
  if (!data.tableMeta[id]) {
    data.tableMeta[id] = { capacity: 1000, active: true }
  }
  return data.tableMeta[id]
}

function persistPlantTables(tables: PlantTable[]): void {
  const state = getState()
  saveState({ ...state, plantTables: tables })
}

function syncTableOverride(
  id: string,
  patch: {
    name?: string
    type?: PlantTableType
    status?: PlantTableStatus
    company?: OrderCompany | null
    orderId?: string | null
    alert?: string | null
  },
): void {
  setAdminPlantOverride(id, patch)
}

export function createAdminTable(
  actor: User,
  input: {
    name: string
    type: PlantTableType
    status: PlantTableStatus
    company: OrderCompany | null
    capacity: number
    active: boolean
  },
): { ok: true; table: AdminTableRow } | { ok: false; error: string } {
  const name = input.name.trim().toUpperCase()
  if (!name) return { ok: false, error: 'missing_fields' }

  const state = getState()
  if (state.plantTables.some((t) => t.name.toUpperCase() === name)) {
    return { ok: false, error: 'duplicate_name' }
  }

  const id = name
  const plantTable: PlantTable = {
    id,
    name,
    type: input.type,
    status: input.status,
    company: input.company,
    orderId: null,
    speedStatus: input.type === 'automatic' ? 'normal' : null,
    alert: null,
  }

  const data = getAdminData()
  data.tableMeta[id] = { capacity: input.capacity, active: input.active }
  saveAdminData(data)
  persistPlantTables([...state.plantTables, plantTable])
  syncTableOverride(id, {
    status: input.status,
    company: input.company,
    orderId: null,
    alert: null,
  })
  addAuditEvent(actor, 'Mesa creada', 'mesa', name)
  return { ok: true, table: getAdminTables().find((t) => t.id === id)! }
}

export function updateAdminTable(
  actor: User,
  id: string,
  input: {
    name: string
    type: PlantTableType
    status: PlantTableStatus
    company: OrderCompany | null
    capacity: number
    active: boolean
  },
): { ok: true; table: AdminTableRow } | { ok: false; error: string } {
  const name = input.name.trim().toUpperCase()
  if (!name) return { ok: false, error: 'missing_fields' }

  const state = getState()
  const index = state.plantTables.findIndex((t) => t.id === id)
  if (index < 0) return { ok: false, error: 'not_found' }

  if (state.plantTables.some((t) => t.id !== id && t.name.toUpperCase() === name)) {
    return { ok: false, error: 'duplicate_name' }
  }

  const current = state.plantTables[index]
  const updated: PlantTable = {
    ...current,
    name,
    id: name === current.name ? current.id : name,
    type: input.type,
    status: input.status,
    company: input.company,
    speedStatus: input.type === 'automatic' ? current.speedStatus ?? 'normal' : null,
  }

  const tables = [...state.plantTables]
  if (name !== current.id) {
    tables.splice(index, 1)
    tables.push(updated)
    const data = getAdminData()
    delete data.tableMeta[current.id]
    data.tableMeta[name] = { capacity: input.capacity, active: input.active }
    saveAdminData(data)
  } else {
    tables[index] = updated
    const data = getAdminData()
    ensureTableMeta(data, id).capacity = input.capacity
    ensureTableMeta(data, id).active = input.active
    saveAdminData(data)
  }

  persistPlantTables(tables)
  syncTableOverride(updated.id, {
    name: updated.name,
    type: updated.type,
    status: updated.status,
    company: updated.company,
    orderId: updated.orderId,
    alert: updated.alert,
  })
  addAuditEvent(actor, 'Mesa editada', 'mesa', name)
  return { ok: true, table: getAdminTables().find((t) => t.id === updated.id)! }
}

export function toggleAdminTableActive(
  actor: User,
  id: string,
): { ok: true } | { ok: false; error: string } {
  const data = getAdminData()
  const meta = ensureTableMeta(data, id)
  meta.active = !meta.active
  saveAdminData(data)
  addAuditEvent(actor, meta.active ? 'Mesa activada' : 'Mesa desactivada', 'mesa', id)
  return { ok: true }
}

export function blockAdminTable(
  actor: User,
  id: string,
): { ok: true } | { ok: false; error: string } {
  const state = getState()
  const index = state.plantTables.findIndex((t) => t.id === id)
  if (index < 0) return { ok: false, error: 'not_found' }

  const tables = [...state.plantTables]
  tables[index] = { ...tables[index], status: 'blocked', alert: 'Bloqueada desde admin' }
  syncTableOverride(id, { status: 'blocked', alert: 'Bloqueada desde admin' })
  persistPlantTables(tables)
  addAuditEvent(actor, 'Mesa bloqueada', 'mesa', id)
  return { ok: true }
}

export function releaseAdminTable(
  actor: User,
  id: string,
): { ok: true } | { ok: false; error: string } {
  const state = getState()
  const index = state.plantTables.findIndex((t) => t.id === id)
  if (index < 0) return { ok: false, error: 'not_found' }

  const tables = [...state.plantTables]
  tables[index] = {
    ...tables[index],
    status: 'free',
    company: null,
    orderId: null,
    alert: null,
    speedStatus: tables[index].type === 'automatic' ? 'normal' : null,
  }
  syncTableOverride(id, { status: 'free', company: null, orderId: null, alert: null })
  persistPlantTables(tables)
  addAuditEvent(actor, 'Mesa liberada', 'mesa', id)
  return { ok: true }
}

/* ── Paletizadores ── */

export function getAdminPalletizers(): AdminPalletizerRow[] {
  const data = getAdminData()
  const state = getState()
  return state.plantPalletizers.map((p) => {
    const meta = data.palletizerMeta[p.id] ?? { capacity: 500, active: true }
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      capacity: meta.capacity,
      alert: p.alert,
      active: meta.active,
    }
  })
}

function persistPalletizers(palletizers: PlantPalletizerElement[]): void {
  const state = getState()
  saveState({ ...state, plantPalletizers: palletizers })
}

export function createAdminPalletizer(
  actor: User,
  input: { name: string; capacity: number; active: boolean },
): { ok: true; row: AdminPalletizerRow } | { ok: false; error: string } {
  const name = input.name.trim().toUpperCase()
  if (!name) return { ok: false, error: 'missing_fields' }

  const state = getState()
  if (state.plantPalletizers.some((p) => p.name.toUpperCase() === name)) {
    return { ok: false, error: 'duplicate_name' }
  }

  const palletizer: PlantPalletizerElement = {
    id: name,
    name,
    type: 'palletizer',
    status: 'idle',
    company: null,
    orderId: null,
    alert: null,
  }

  const data = getAdminData()
  data.palletizerMeta[name] = { capacity: input.capacity, active: input.active }
  saveAdminData(data)
  persistPalletizers([...state.plantPalletizers, palletizer])
  addAuditEvent(actor, 'Paletizador creado', 'paletizador', name)
  return { ok: true, row: getAdminPalletizers().find((p) => p.id === name)! }
}

export function updateAdminPalletizer(
  actor: User,
  id: string,
  input: { name: string; status: PlantPalletizerElement['status']; capacity: number; alert: string | null; active: boolean },
): { ok: true; row: AdminPalletizerRow } | { ok: false; error: string } {
  const name = input.name.trim().toUpperCase()
  if (!name) return { ok: false, error: 'missing_fields' }

  const state = getState()
  const index = state.plantPalletizers.findIndex((p) => p.id === id)
  if (index < 0) return { ok: false, error: 'not_found' }

  const updated: PlantPalletizerElement = {
    ...state.plantPalletizers[index],
    name,
    id: name,
    status: input.status,
    alert: input.alert,
  }

  const palletizers = [...state.plantPalletizers]
  palletizers[index] = updated

  const data = getAdminData()
  if (!data.palletizerMeta[id]) data.palletizerMeta[id] = { capacity: 500, active: true }
  data.palletizerMeta[id].capacity = input.capacity
  data.palletizerMeta[id].active = input.active
  if (name !== id) {
    data.palletizerMeta[name] = data.palletizerMeta[id]
    delete data.palletizerMeta[id]
  }
  saveAdminData(data)
  persistPalletizers(palletizers)
  addAuditEvent(actor, 'Paletizador editado', 'paletizador', name)
  return { ok: true, row: getAdminPalletizers().find((p) => p.id === name)! }
}

export function toggleAdminPalletizerActive(actor: User, id: string): { ok: true } | { ok: false; error: string } {
  const data = getAdminData()
  if (!data.palletizerMeta[id]) data.palletizerMeta[id] = { capacity: 500, active: true }
  data.palletizerMeta[id].active = !data.palletizerMeta[id].active
  saveAdminData(data)
  addAuditEvent(
    actor,
    data.palletizerMeta[id].active ? 'Paletizador activado' : 'Paletizador desactivado',
    'paletizador',
    id,
  )
  return { ok: true }
}

export function markPalletizerConflict(actor: User, id: string): { ok: true } | { ok: false; error: string } {
  const state = getState()
  const index = state.plantPalletizers.findIndex((p) => p.id === id)
  if (index < 0) return { ok: false, error: 'not_found' }

  const palletizers = [...state.plantPalletizers]
  palletizers[index] = { ...palletizers[index], status: 'conflict', alert: 'Conflicto simulado' }
  persistPalletizers(palletizers)
  addAuditEvent(actor, 'Paletizador en conflicto', 'paletizador', id)
  return { ok: true }
}

export function resolvePalletizerConflict(actor: User, id: string): { ok: true } | { ok: false; error: string } {
  const state = getState()
  const index = state.plantPalletizers.findIndex((p) => p.id === id)
  if (index < 0) return { ok: false, error: 'not_found' }

  const palletizers = [...state.plantPalletizers]
  palletizers[index] = { ...palletizers[index], status: 'idle', alert: null }
  persistPalletizers(palletizers)
  addAuditEvent(actor, 'Conflicto resuelto', 'paletizador', id)
  return { ok: true }
}

/* ── Configuración ── */

export function saveProductionConfig(
  actor: User,
  config: ProductionConfig,
): { ok: true } | { ok: false; error: string } {
  if (config.boxesPerLayer <= 0) return { ok: false, error: 'invalid_boxes_per_layer' }
  if (config.minBoxesPerHour <= 0 || config.maxBoxesPerHour <= 0) {
    return { ok: false, error: 'invalid_speed' }
  }
  if (config.sumoCapacity < 0 || config.mafCapacity < 0) {
    return { ok: false, error: 'invalid_capacity' }
  }

  const data = getAdminData()
  data.productionConfig = { ...config }
  saveAdminData(data)
  addAuditEvent(actor, 'Configuración guardada', 'configuracion', 'Parámetros de producción mock')
  return { ok: true }
}

export function resetProductionConfig(actor: User): ProductionConfig {
  const data = getAdminData()
  data.productionConfig = { ...DEFAULT_CONFIG }
  saveAdminData(data)
  addAuditEvent(actor, 'Configuración restaurada', 'configuracion', 'Valores por defecto')
  return data.productionConfig
}

export function canAccessAdmin(user: User): boolean {
  return user.role === 'master'
}
