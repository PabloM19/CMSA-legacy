import type { CreatedOrder } from '../types/newOrder'

const STORAGE_KEY = 'cmsa-created-orders'

export function getCreatedOrders(): CreatedOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CreatedOrder[]
  } catch {
    return []
  }
}

export function saveCreatedOrder(order: CreatedOrder): void {
  const existing = getCreatedOrders()
  localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...existing]))
}

export function generateOrderId(): string {
  return `ord-${Date.now()}`
}
