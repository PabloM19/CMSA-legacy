import { mockBacklogOrders, convertCreatedOrder } from '../data/mockBacklogOrders'
import type { BacklogOrder } from '../types/backlog'
import type { CreatedOrder } from '../types/newOrder'
import { getCreatedOrders } from './orderStorage'

export const BACKLOG_STORAGE_KEY = 'cmsa-backlog-orders'

const COLUMN_IDS = [
  'en_backlog',
  'pendiente_lanzamiento',
  'pendiente_validacion',
  'en_ejecucion',
  'bloqueado',
  'finalizado',
] as const

function readRaw(): BacklogOrder[] {
  try {
    const raw = localStorage.getItem(BACKLOG_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as BacklogOrder[]
  } catch {
    return []
  }
}

export function normalizePriorities(orders: BacklogOrder[]): BacklogOrder[] {
  const result = orders.map((o) => ({ ...o }))
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

function seedInitial(): BacklogOrder[] {
  return normalizePriorities([...mockBacklogOrders])
}

/** Fuente consolidada de pedidos del backlog. */
export function getOrders(): BacklogOrder[] {
  let orders = readRaw()

  if (orders.length === 0) {
    orders = seedInitial()
  }

  orders = syncLegacyCreatedOrders(orders)
  orders = normalizePriorities(orders)
  saveOrders(orders)
  return orders
}

export function saveOrders(orders: BacklogOrder[]): void {
  localStorage.setItem(BACKLOG_STORAGE_KEY, JSON.stringify(normalizePriorities(orders)))
}

/** Inserta o actualiza un pedido por id sin duplicar. */
export function mergeOrder(order: BacklogOrder): BacklogOrder[] {
  const orders = readRaw()
  const base = orders.length > 0 ? orders : seedInitial()
  const map = new Map<string, BacklogOrder>()
  base.forEach((o) => map.set(o.id, o))
  map.set(order.id, order)
  const merged = normalizePriorities(Array.from(map.values()))
  saveOrders(merged)
  return merged
}

export function mergeCreatedOrder(created: CreatedOrder): BacklogOrder[] {
  return mergeOrder(convertCreatedOrder(created))
}

export function updateOrder(
  id: string,
  updater: (order: BacklogOrder) => BacklogOrder,
): BacklogOrder[] {
  const orders = getOrders()
  const next = orders.map((o) => (o.id === id ? updater(o) : o))
  saveOrders(next)
  return next
}

export function replaceOrders(orders: BacklogOrder[]): BacklogOrder[] {
  saveOrders(orders)
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

export function formatTableLabel(table: string): string {
  if (table.startsWith('Mesa ')) return table
  const match = table.match(/^M(\d+)$/i)
  if (match) return `Mesa ${match[1].padStart(2, '0')}`
  return table
}

export function formatTableList(tables: string[]): string {
  return tables.map(formatTableLabel).join(', ')
}
