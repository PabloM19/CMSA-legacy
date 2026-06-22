export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'in_progress'
  | 'validation'
  | 'completed'
  | 'cancelled'

export interface Order {
  id: string
  code: string
  product: string
  quantity: number
  status: OrderStatus
  createdAt: string
}
