import type { OrderCompany } from './newOrder'

export type DailyOrderStatus =
  | 'pendiente'
  | 'parcialmente_asignado'
  | 'en_produccion'
  | 'completado'
  | 'ampliado'
  | 'bloqueado'

export interface DailyOrderEvent {
  id: string
  at: string
  action: string
  user?: string
  detail?: string
}

export interface DailyOrder {
  id: string
  fecha: string
  estilo: string
  referencia: string
  barcode: string
  empresa: OrderCompany
  producto: string
  variedad: string
  totalCajasDia: number
  cajasAsignadas: number
  cajasCompletadas: number
  cajasRestantes: number
  porcentajeAsignado: number
  porcentajeCompletado: number
  porcentajeRestante: number
  estado: DailyOrderStatus
  ordenesProduccionIds: string[]
  events: DailyOrderEvent[]
}

export interface DailyOrdersSummaryStats {
  totalCajasDia: number
  cajasAsignadas: number
  cajasCompletadas: number
  cajasRestantes: number
  ordenesEnProduccion: number
  eventosActivos: number
}
