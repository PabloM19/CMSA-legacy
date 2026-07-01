import type { BacklogOrder, ValidationTableStatus } from '../types/backlog'
import type { PlantTable, PlantTableStatus } from '../types/plant'
import { applyUnassignedTableDemos } from '../data/mockPlantTables'

const FREE: PlantTableStatus = 'free'

export function releaseTablesForOrder(orderId: string, plantTables: PlantTable[]): PlantTable[] {
  return plantTables.map((table) =>
    table.orderId === orderId
      ? {
          ...table,
          status: FREE,
          company: null,
          orderId: null,
          alert: null,
        }
      : table,
  )
}

export function syncPlantTableStatus(
  plantTables: PlantTable[],
  plantTableId: string,
  status: PlantTableStatus,
): PlantTable[] {
  return plantTables.map((table) =>
    table.id === plantTableId ? { ...table, status } : table,
  )
}

export function mapValidationStatusToPlant(
  validationStatus: ValidationTableStatus,
): PlantTableStatus {
  switch (validationStatus) {
    case 'validada':
      return 'validated'
    case 'conflicto':
      return 'conflict'
    case 'parada':
      return 'waiting'
    default:
      return 'pending_validation'
  }
}

export function syncPlantFromValidationTables(
  plantTables: PlantTable[],
  order: BacklogOrder,
): PlantTable[] {
  const ids = new Set((order.validationTables ?? []).map((t) => t.plantTableId))
  return plantTables.map((table) => {
    if (!ids.has(table.id)) return table
    const vt = order.validationTables!.find((v) => v.plantTableId === table.id)!
    return {
      ...table,
      status: mapValidationStatusToPlant(vt.status),
      company: order.company,
      orderId: order.id,
    }
  })
}

export function occupyOrderTables(orderId: string, plantTables: PlantTable[]): PlantTable[] {
  return plantTables.map((table) =>
    table.orderId === orderId && table.status === 'validated'
      ? { ...table, status: 'occupied' as const }
      : table.orderId === orderId
        ? { ...table, status: 'occupied' as const }
        : table,
  )
}

function isBlockedProduction(order: BacklogOrder): boolean {
  return (
    order.column === 'en_produccion' &&
    (order.productionState === 'temp_blocked' || order.productionState === 'element_blocked')
  )
}

export function rebuildPlantTablesFromOrders(
  plantTables: PlantTable[],
  orders: BacklogOrder[],
): PlantTable[] {
  let next: PlantTable[] = plantTables.map((t) => ({
    ...t,
    status: FREE,
    company: null,
    orderId: null,
    alert: t.id === 'M5' && orders.some((o) => o.id === 'bk-5' && isBlockedProduction(o))
      ? t.alert
      : null,
  }))

  orders.forEach((order) => {
    const ids = order.assignedTableIds?.length
      ? order.assignedTableIds
      : order.assignedTables.filter((id) => /^R\d+$|^M\d+$/i.test(id))

    if (ids.length === 0) return

    if (order.column === 'en_preparacion') {
      next = next.map((table) => {
        if (!ids.includes(table.id)) return table
        const vt = order.validationTables?.find((v) => v.plantTableId === table.id)
        return {
          ...table,
          company: order.company,
          orderId: order.id,
          status: vt ? mapValidationStatusToPlant(vt.status) : 'preparing',
        }
      })
    } else if (order.column === 'en_produccion') {
      const blocked = isBlockedProduction(order)
      const critical = order.productionState === 'element_blocked'
      next = next.map((table) => {
        if (!ids.includes(table.id)) return table
        const speedStatus =
          order.id === 'bk-alm-1' && table.type === 'automatic'
            ? ('slow' as const)
            : table.speedStatus
        return {
          ...table,
          status: critical
            ? 'conflict'
            : blocked
              ? 'blocked'
              : order.productionState === 'temp_waiting'
                ? 'waiting'
                : 'occupied',
          company: order.company,
          orderId: order.id,
          alert: order.alerts[0] ?? (blocked || critical ? table.alert : null),
          speedStatus,
        }
      })
    }
  })

  return applyUnassignedTableDemos(next)
}
