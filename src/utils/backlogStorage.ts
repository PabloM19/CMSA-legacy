import { mockBacklogOrders, convertCreatedOrder } from '../data/mockBacklogOrders'
import { createSeedPlantTables } from '../data/mockPlantTables'
import type { BacklogOrder } from '../types/backlog'
import type { CmsaPersistedState, PlantTable } from '../types/plant'
import type { CreatedOrder } from '../types/newOrder'
import { getCreatedOrders } from './orderStorage'
import { rebuildPlantTablesFromOrders } from './plantSync'
import { isPlantTableId, formatTableLabel, resolveAssignedTableIds } from './tableAssignment'
import { normalizeOrdersValidation } from './validationHelpers'

export const BACKLOG_STORAGE_KEY = 'cmsa-backlog-orders'

const COLUMN_IDS = [
  'en_backlog',
  'pendiente_lanzamiento',
  'pendiente_validacion',
  'en_ejecucion',
  'bloqueado',
  'finalizado',
] as const

function normalizeOrderFields(order: BacklogOrder): BacklogOrder {
  const ids = resolveAssignedTableIds(order).filter(isPlantTableId)

  return {
    ...order,
    assignedTableIds: ids,
    assignedTables: ids.length > 0 ? ids : (order.assignedTables ?? []).filter(Boolean),
    assignmentMode: order.assignmentMode ?? (ids.length > 0 ? 'automatic' : 'none'),
    validationTables: (order.validationTables ?? []).map((table) => ({
      ...table,
      plantTableId: table.plantTableId ?? table.name ?? '',
      name: formatTableLabel(table.plantTableId ?? table.name),
    })),
  }
}

function readRawState(): CmsaPersistedState | null {
  try {
    const raw = localStorage.getItem(BACKLOG_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return {
        orders: parsed as BacklogOrder[],
        plantTables: createSeedPlantTables(),
      }
    }
    return parsed as CmsaPersistedState
  } catch {
    return null
  }
}

export function normalizePriorities(orders: BacklogOrder[]): BacklogOrder[] {
  const result = orders.map((o) => normalizeOrderFields(o))
  COLUMN_IDS.forEach((col) => {
    const colOrders = result
      .filter((o) => o.column === col)
      .sort((a, b) => a.priority - b.priority)
    colOrders.forEach((o, idx) => {
      o.priority = idx + 1
    })
  })
  return result
}

function mergeById(existing: BacklogOrder[], incoming: BacklogOrder[]): BacklogOrder[] {
  const map = new Map<string, BacklogOrder>()
  existing.forEach((o) => map.set(o.id, o))
  incoming.forEach((o) => {
    if (!map.has(o.id)) {
      map.set(o.id, o)
    }
  })
  return Array.from(map.values())
}

function syncLegacyCreatedOrders(orders: BacklogOrder[]): BacklogOrder[] {
  const pending = getCreatedOrders().map(convertCreatedOrder)
  if (pending.length === 0) return orders
  return mergeById(orders, pending)
}

function seedInitialState(): CmsaPersistedState {
  const orders = normalizeOrdersValidation(normalizePriorities([...mockBacklogOrders]))
  const plantTables = rebuildPlantTablesFromOrders(createSeedPlantTables(), orders)
  return { orders, plantTables }
}

function hydrateState(state: CmsaPersistedState): CmsaPersistedState {
  let orders = syncLegacyCreatedOrders(state.orders.map(normalizeOrderFields))
  orders = normalizeOrdersValidation(orders)
  orders = normalizePriorities(orders)
  const plantTables = rebuildPlantTablesFromOrders(
    state.plantTables.length > 0 ? state.plantTables : createSeedPlantTables(),
    orders,
  )
  return { orders, plantTables }
}

/** Fuente consolidada: pedidos + mesas de planta. */
export function getState(): CmsaPersistedState {
  let state = readRawState()
  if (!state || state.orders.length === 0) {
    state = seedInitialState()
  }
  state = hydrateState(state)
  saveState(state)
  return state
}

export function getOrders(): BacklogOrder[] {
  return getState().orders
}

export function getPlantTables(): PlantTable[] {
  return getState().plantTables
}

export function saveState(state: CmsaPersistedState): void {
  const hydrated = hydrateState(state)
  localStorage.setItem(BACKLOG_STORAGE_KEY, JSON.stringify(hydrated))
}

export function saveOrders(orders: BacklogOrder[]): void {
  const current = getState()
  saveState({ ...current, orders })
}

export function saveOrdersAndPlant(orders: BacklogOrder[], plantTables: PlantTable[]): void {
  saveState({ orders, plantTables })
}

export function mergeOrder(order: BacklogOrder): BacklogOrder[] {
  const state = getState()
  const map = new Map<string, BacklogOrder>()
  state.orders.forEach((o) => map.set(o.id, o))
  map.set(order.id, order)
  const orders = normalizePriorities(Array.from(map.values()))
  saveState({ ...state, orders })
  return orders
}

export function mergeCreatedOrder(created: CreatedOrder): BacklogOrder[] {
  return mergeOrder(convertCreatedOrder(created))
}

export function updateOrder(
  id: string,
  updater: (order: BacklogOrder) => BacklogOrder,
): BacklogOrder[] {
  const state = getState()
  const orders = state.orders.map((o) => (o.id === id ? updater(o) : o))
  saveState({ ...state, orders })
  return orders
}

export function replaceOrders(orders: BacklogOrder[]): BacklogOrder[] {
  const state = getState()
  saveState({ ...state, orders })
  return orders
}

/** @deprecated Usar getOrders */
export function loadBacklogOrders(): BacklogOrder[] {
  return getOrders()
}

/** @deprecated Usar saveOrders */
export function saveBacklogOrders(orders: BacklogOrder[]): void {
  saveOrders(orders)
}

export function formatTableList(tables: string[]): string {
  return tables.map((t) => formatTableLabel(t)).join(', ')
}

export { formatTableLabel, resolveAssignedTableIds } from './tableAssignment'

export function getPlantTableClassName(table: PlantTable): string {
  const classes = [
    'table',
    `table--${table.type}`,
    table.company ? `table--${table.company.toLowerCase()}` : '',
    `table--${table.status}`,
  ]
  return classes.filter(Boolean).join(' ')
}
