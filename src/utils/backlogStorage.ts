import { mockBacklogOrders, convertCreatedOrder, getSeedDailyOrders } from '../data/mockBacklogOrders'
import {
  DEMO_SCENARIO_VERSION,
  DEMO_SCENARIO_ORDER_IDS,
  applyScenarioPlantVisuals,
  buildFullDemoState,
  isLegacyScenarioState,
  hasLegacyProductionOrderIds,
} from '../data/demoScenario'
import { buildSyncedDailyOrders, applyDailyOrderSeedLabels, syncAllDailyOrders } from './dailyOrderHelpers'
import type { DailyOrder } from '../types/dailyOrder'
import { createCleanPalletizers, createCleanPlantTables, createSeedPalletizers, createSeedPlantTables } from '../data/mockPlantTables'
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
        dailyOrders: getSeedDailyOrders(),
        orders: parsed as BacklogOrder[],
        plantTables: createSeedPlantTables(),
        plantPalletizers: createSeedPalletizers(),
      }
    }
    const legacy = parsed as CmsaPersistedState
    return {
      ...legacy,
      dailyOrders: legacy.dailyOrders?.length ? legacy.dailyOrders : getSeedDailyOrders(),
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
  const pending = getCreatedOrders().map((o) => convertCreatedOrder(o))
  if (pending.length === 0) return orders
  return mergeById(orders, pending)
}

function seedInitialState(): CmsaPersistedState {
  const orders = normalizePriorities([...mockBacklogOrders])
  const dailyOrders = buildSyncedDailyOrders(orders)
  return buildFullDemoState(dailyOrders, orders)
}

function ensureDemoScenarioOrders(orders: BacklogOrder[]): BacklogOrder[] {
  const map = new Map(orders.map((order) => [order.id, order]))

  for (const id of DEMO_SCENARIO_ORDER_IDS) {
    if (!map.has(id)) {
      const seed = mockBacklogOrders.find((order) => order.id === id)
      if (seed) map.set(id, seed)
    }
  }

  return Array.from(map.values())
}

function hydrateState(state: CmsaPersistedState): CmsaPersistedState {
  if (
    isLegacyScenarioState(state.dailyOrders) ||
    hasLegacyProductionOrderIds(state.orders) ||
    state.scenarioVersion !== DEMO_SCENARIO_VERSION
  ) {
    const orders = normalizePriorities([...mockBacklogOrders])
    const dailyOrders = buildSyncedDailyOrders(orders)
    return buildFullDemoState(dailyOrders, orders)
  }

  let orders = syncLegacyCreatedOrders(
    ensureDemoScenarioOrders(migrateBacklogOrders(state.orders.map(normalizeOrderFields))),
  )
  orders = normalizePriorities(orders)
  const labeledDaily = applyDailyOrderSeedLabels(
    state.dailyOrders?.length ? state.dailyOrders : getSeedDailyOrders(),
  )
  const dailyOrders = buildSyncedDailyOrders(orders, labeledDaily)

  const usesScenarioOrders = orders.some((o) => DEMO_SCENARIO_ORDER_IDS.includes(o.id))
  const plantVisuals = usesScenarioOrders
    ? applyScenarioPlantVisuals(createCleanPlantTables(), createCleanPalletizers(), orders)
    : {
        plantTables: rebuildPlantTablesFromOrders(
          state.plantTables?.length > 0 ? state.plantTables : createSeedPlantTables(),
          orders,
        ),
        plantPalletizers:
          state.plantPalletizers?.length > 0 ? state.plantPalletizers : createSeedPalletizers(),
      }

  const plantTables = applyAdminPlantOverrides(plantVisuals.plantTables)
  const plantPalletizers = plantVisuals.plantPalletizers
  return {
    scenarioVersion: DEMO_SCENARIO_VERSION,
    dailyOrders,
    orders,
    plantTables,
    plantPalletizers,
  }
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

export function getDailyOrders(): DailyOrder[] {
  return getState().dailyOrders
}

export function saveOrdersAndPlant(
  orders: BacklogOrder[],
  plantTables: PlantTable[],
  dailyOrders?: DailyOrder[],
): void {
  const current = getState()
  const baseDaily = dailyOrders ?? current.dailyOrders
  const nextDaily = syncAllDailyOrders(baseDaily, orders)
  saveState({ ...current, orders, plantTables, dailyOrders: nextDaily })
}

export function appendDailyOrderAndSave(
  dailyOrders: DailyOrder[],
  orders: BacklogOrder[],
  plantTables: PlantTable[],
): DailyOrder[] {
  const synced = syncAllDailyOrders(dailyOrders, orders)
  saveState({ ...getState(), orders, plantTables, dailyOrders: synced })
  return synced
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
