import { mockBacklogOrders, convertCreatedOrder } from '../data/mockBacklogOrders'
import { createSeedPalletizers, createSeedPlantTables } from '../data/mockPlantTables'
import type { BacklogOrder } from '../types/backlog'
import type { CmsaPersistedState, PlantPalletizerElement, PlantPalletizerStatus, PlantTable } from '../types/plant'
import { readTabletOverrides } from './tabletStorage'
import { applyAdminPlantOverrides } from './adminPlantOverrides'
import type { CreatedOrder } from '../types/newOrder'
import { getCreatedOrders } from './orderStorage'
import { rebuildPlantTablesFromOrders } from './plantSync'
import { isPlantTableId, formatTableLabel, resolveAssignedTableIds } from './tableAssignment'
import { migrateBacklogOrders } from './backlogMigration'

export const BACKLOG_STORAGE_KEY = 'cmsa-backlog-orders'

const COLUMN_IDS = [
  'en_backlog',
  'en_preparacion',
  'en_produccion',
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
        plantPalletizers: createSeedPalletizers(),
      }
    }
    const legacy = parsed as CmsaPersistedState
    return {
      ...legacy,
      plantPalletizers: legacy.plantPalletizers?.length
        ? legacy.plantPalletizers
        : createSeedPalletizers(),
    }
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
  const orders = normalizePriorities([...mockBacklogOrders])
  const plantTables = rebuildPlantTablesFromOrders(createSeedPlantTables(), orders)
  return { orders, plantTables, plantPalletizers: createSeedPalletizers() }
}

const DEMO_ALARM_IDS = ['bk-alm-1', 'bk-alm-2', 'bk-alm-3'] as const

function ensureDemoAlarmOrders(orders: BacklogOrder[]): BacklogOrder[] {
  const map = new Map(orders.map((order) => [order.id, order]))

  for (const id of DEMO_ALARM_IDS) {
    if (!map.has(id)) {
      const seed = mockBacklogOrders.find((order) => order.id === id)
      if (seed) map.set(id, seed)
    }
  }

  const bk2 = map.get('bk-2')
  if (bk2?.assignedTableIds?.includes('R4')) {
    const seed = mockBacklogOrders.find((order) => order.id === 'bk-2')
    if (seed) map.set('bk-2', seed)
  }

  const bk7 = map.get('bk-7')
  if (bk7?.assignedTableIds?.includes('M2')) {
    const seed = mockBacklogOrders.find((order) => order.id === 'bk-7')
    if (seed) map.set('bk-7', seed)
  }

  return Array.from(map.values())
}

function hydrateState(state: CmsaPersistedState): CmsaPersistedState {
  let orders = syncLegacyCreatedOrders(
    ensureDemoAlarmOrders(migrateBacklogOrders(state.orders.map(normalizeOrderFields))),
  )
  orders = normalizePriorities(orders)
  const plantTables = applyAdminPlantOverrides(
    rebuildPlantTablesFromOrders(
      state.plantTables?.length > 0 ? state.plantTables : createSeedPlantTables(),
      orders,
    ),
  )
  const plantPalletizers =
    state.plantPalletizers?.length > 0 ? state.plantPalletizers : createSeedPalletizers()
  return { orders, plantTables, plantPalletizers }
}

function applyTabletOverrides(state: CmsaPersistedState): CmsaPersistedState {
  const overrides = readTabletOverrides()
  if (Object.keys(overrides).length === 0) return state

  return {
    ...state,
    plantTables: state.plantTables.map((table) => {
      const override = overrides[table.id]
      if (!override) return table
      return {
        ...table,
        status: override.status as PlantTable['status'],
        alert: override.alert,
      }
    }),
    plantPalletizers: state.plantPalletizers.map((palletizer) => {
      const override = overrides[palletizer.id]
      if (!override) return palletizer
      return {
        ...palletizer,
        status: override.status as PlantPalletizerStatus,
        alert: override.alert,
      }
    }),
  }
}

/** Fuente consolidada: pedidos + mesas de planta. */
export function getState(): CmsaPersistedState {
  let state = readRawState()
  if (!state || state.orders.length === 0) {
    state = seedInitialState()
  }
  state = hydrateState(state)
  saveState(state)
  return applyTabletOverrides(state)
}

export function getOrders(): BacklogOrder[] {
  return getState().orders
}

export function getPlantTables(): PlantTable[] {
  return getState().plantTables
}

export function getPlantPalletizers(): PlantPalletizerElement[] {
  return getState().plantPalletizers
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
  const current = getState()
  saveState({ ...current, orders, plantTables })
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
