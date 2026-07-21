import type { BacklogOrder } from '../types/backlog'
import type { PlantElementView, PlantTable } from '../types/plant'
import { countActiveAlarms } from '../data/mockCellAlarms'

export interface PlantMapSummaryStats {
  freeTables: number
  freeManual: number
  freeRobot: number
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
  orders: BacklogOrder[],
): PlantMapSummaryStats {
  const orderMap = new Map(orders.map((order) => [order.id, order]))

  let freeTables = 0
  let freeManual = 0
  let freeRobot = 0
  let occupiedTables = 0
  let occupiedSumo = 0
  let occupiedMaf = 0
  let preparing = 0
  let waiting = 0
  let blockedOrConflict = 0

  elements.forEach((element) => {
    if (element.isDisabled) return

    const order = element.orderId ? orderMap.get(element.orderId) ?? null : null
    const isPreparation = order?.column === 'en_preparacion'

    if (isTable(element)) {
      if (isPreparation) {
        preparing += 1
        return
      }

      switch (element.status) {
        case 'free':
        case 'idle':
          freeTables += 1
          if (element.type === 'manual') freeManual += 1
          if (element.type === 'automatic') freeRobot += 1
          break
        case 'occupied':
        case 'validated':
          occupiedTables += 1
          if (element.company === 'SUMO') occupiedSumo += 1
          if (element.company === 'MAF') occupiedMaf += 1
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

    if (isPreparation) {
      preparing += 1
      return
    }

    if (element.status === 'waiting') waiting += 1
    if (element.status === 'blocked' || element.status === 'conflict') blockedOrConflict += 1
  })

  const activeAlarms = countActiveAlarms()

  return {
    freeTables,
    freeManual,
    freeRobot,
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
  if (table.status === 'waiting') return 28 + (seed % 25)
  if (table.status === 'blocked' || table.status === 'conflict') return 45 + (seed % 30)
  return 55 + (seed % 40)
}
