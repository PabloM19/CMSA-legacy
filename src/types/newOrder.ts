import type { Company } from './auth'

export type OrderCompany = Extract<Company, 'SUMO' | 'MAF'>

export interface NewOrderFormData {
  company: OrderCompany
  reference: string
  productId: string
  productReference: string
  productName: string
  product: string
  variety: string
  type: string
  boxFormat: string
  boxes: string
  boxesPerHour: string
  barcode: string
}

export type NewOrderFormErrors = Partial<Record<keyof NewOrderFormData, string>>

export interface OrderAlert {
  type: 'warning' | 'critical'
  message: string
}

export interface OrderCalculation {
  requiredTables: number
  eta: string
  estimatedEnd: string
  capacityConsumed: number
  alerts: OrderAlert[]
  blocked: boolean
  blockReason?: string
}

export interface CreatedOrder {
  id: string
  company: OrderCompany
  reference: string
  productId?: string
  productReference?: string
  productName?: string
  product: string
  variety: string
  type: string
  boxFormat: string
  boxes: number
  boxesPerHour: number
  notes?: string
  barcode?: string
  createdAt: string
  status: 'pending'
  calculation: OrderCalculation
}
