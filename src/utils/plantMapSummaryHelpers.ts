import type { BacklogOrder } from '../types/backlog'
import type { PlantElementView, PlantTable } from '../types/plant'
import { countActiveAlarms } from '../data/mockCellAlarms'

export interface PlantMapSummaryStats {
  freeTables: number
  occupiedTables: number
  occupiedSumo: number
  occupiedMaf: number
  preparing: number
  waiting: number
  blockedOrConflict: number
  activeAlarms: number
}

function isTable(element: PlantElementView): boolean {
  return element.type === 'automatic' || element.type === 'manual'
}

export function computePlantMapSummaryStats(
  elements: Map<string, PlantElementView>,
  _orders: BacklogOrder[],
): PlantMapSummaryStats {
  let freeTables = 0
  let occupiedTables = 0
  let occupiedSumo = 0
  let occupiedMaf = 0
  let preparing = 0
  let waiting = 0
  let blockedOrConflict = 0

  elements.forEach((element) => {
    if (isTable(element)) {
      switch (element.status) {
        case 'free':
          freeTables += 1
          break
        case 'occupied':
        case 'validated':
          occupiedTables += 1
          if (element.company === 'SUMO') occupiedSumo += 1
          if (element.company === 'MAF') occupiedMaf += 1
          break
        case 'preparing':
        case 'reserved':
        case 'pending_validation':
          preparing += 1
          break
        case 'waiting':
          waiting += 1
          break
        case 'blocked':
        case 'conflict':
          blockedOrConflict += 1
          break
        default:
          break
      }
      return
    }

    if (element.status === 'waiting') waiting += 1
    if (element.status === 'blocked' || element.status === 'conflict') blockedOrConflict += 1
  })

  const activeAlarms = countActiveAlarms()

  return {
    freeTables,
    occupiedTables,
    occupiedSumo,
    occupiedMaf,
    preparing,
    waiting,
    blockedOrConflict,
    activeAlarms,
  }
}

export function mockOccupancyPercent(table: PlantTable): number | null {
  if (table.status === 'free') return null
  const seed = table.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  if (table.status === 'preparing' || table.status === 'reserved') return 12 + (seed % 18)
  if (table.status === 'waiting') return 28 + (seed % 25)
  if (table.status === 'blocked' || table.status === 'conflict') return 45 + (seed % 30)
  return 55 + (seed % 40)
}
