export type ZoneStatus = 'idle' | 'active' | 'blocked' | 'maintenance'

export interface PlantZone {
  id: string
  name: string
  status: ZoneStatus
  capacity: number
  occupied: number
}
