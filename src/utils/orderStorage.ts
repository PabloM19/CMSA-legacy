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

export function clearCreatedOrders(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function saveCreatedOrder(order: CreatedOrder): void {
  const existing = getCreatedOrders()
  localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...existing]))
}

export function generateOrderId(): string {
  return `ord-${Date.now()}`
}

export function generateOrderReference(): string {
  const d = new Date()
  const y = d.getFullYear().toString().slice(-2)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 89) + 10)
  return `PED-${y}${m}${day}-${seq}`
}
