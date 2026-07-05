export type CellAlarmSeverity = 'info' | 'warning' | 'critical'
export type CellAlarmStatus = 'active' | 'reviewed' | 'resolved'

export interface CellAlarm {
  id: string
  cellCode: string
  type: string
  /** Microcopy corto para listados */
  summary: string
  severity: CellAlarmSeverity
  time: string
  orderReference: string
  company: 'SUMO' | 'MAF'
  product: string
  variety: string
  message: string
  status: CellAlarmStatus
  /** Evento operativo vs alarma real de seguridad (esta no va en tabla de eventos). */
  category?: 'operational' | 'safety'
  /** Situación crítica — alto volumen / high runner afectado. */
  isCritical?: boolean
}
