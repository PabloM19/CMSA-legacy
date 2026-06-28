import type { BacklogOrder } from '../types/backlog'
import type { PlantElementView } from '../types/plant'

export interface PlantMapSummaryStats {
  freeTables: number
  occupiedTables: number
  pendingValidation: number
  waiting: number
  blockedOrConflict: number
  ordersInProduction: number
}

function isTable(element: PlantElementView): boolean {
  return element.type === 'automatic' || element.type === 'manual'
}

export function computePlantMapSummaryStats(
  elements: Map<string, PlantElementView>,
  orders: BacklogOrder[],
): PlantMapSummaryStats {
  let freeTables = 0
  let occupiedTables = 0
  let pendingValidation = 0
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
          break
        case 'pending_validation':
        case 'reserved':
          pendingValidation += 1
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

  const ordersInProduction = orders.filter((order) => order.column === 'en_ejecucion').length

  return {
    freeTables,
    occupiedTables,
    pendingValidation,
    waiting,
    blockedOrConflict,
    ordersInProduction,
  }
}
