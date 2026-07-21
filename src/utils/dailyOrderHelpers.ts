import type { DailyOrder, DailyOrderEvent, DailyOrdersSummaryStats } from '../types/dailyOrder'
import type { BacklogOrder } from '../types/backlog'
import { DEMO_DAILY_ORDER_TEMPLATES } from '../data/demoScenario'

export function pct(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 1000) / 10
}

export function recalcDailyOrder(order: DailyOrder): DailyOrder {
  const cajasRestantes = Math.max(0, order.totalCajasDia - order.cajasAsignadas)
  const porcentajeAsignado = pct(order.cajasAsignadas, order.totalCajasDia)
  const porcentajeCompletado = pct(order.cajasCompletadas, order.totalCajasDia)
  const porcentajeRestante = pct(cajasRestantes, order.totalCajasDia)

  let estado = order.estado
  if (order.cajasCompletadas >= order.totalCajasDia) {
    estado = 'completado'
  } else if (order.cajasAsignadas > 0 && order.cajasAsignadas < order.totalCajasDia) {
    estado = estado === 'ampliado' ? 'ampliado' : 'parcialmente_asignado'
  } else if (order.cajasAsignadas >= order.totalCajasDia && order.cajasCompletadas < order.totalCajasDia) {
    estado = 'en_produccion'
  } else if (order.cajasAsignadas === 0) {
    estado = estado === 'bloqueado' ? 'bloqueado' : 'pendiente'
  }

  return {
    ...order,
    cajasRestantes,
    porcentajeAsignado,
    porcentajeCompletado,
    porcentajeRestante,
    estado,
  }
}

export function recalcAllDailyOrders(orders: DailyOrder[]): DailyOrder[] {
  return orders.map(recalcDailyOrder)
}

export function computeDailyOrdersSummary(
  dailyOrders: DailyOrder[],
  productionOrders: BacklogOrder[],
): DailyOrdersSummaryStats {
  const totalCajasDia = dailyOrders.reduce((s, d) => s + d.totalCajasDia, 0)
  const cajasAsignadas = dailyOrders.reduce((s, d) => s + d.cajasAsignadas, 0)
  const cajasCompletadas = dailyOrders.reduce((s, d) => s + d.cajasCompletadas, 0)
  const cajasRestantes = dailyOrders.reduce((s, d) => s + d.cajasRestantes, 0)
  const ordenesEnProduccion = productionOrders.filter((o) => o.column === 'en_produccion').length
  const eventosActivos = dailyOrders.reduce((s, d) => s + d.events.length, 0)

  return {
    totalCajasDia,
    cajasAsignadas,
    cajasCompletadas,
    cajasRestantes,
    ordenesEnProduccion,
    eventosActivos,
  }
}

export function appendDailyOrderEvent(
  order: DailyOrder,
  action: string,
  user?: string,
  detail?: string,
): DailyOrder {
  const event: DailyOrderEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    action,
    user,
    detail,
  }
  return recalcDailyOrder({
    ...order,
    events: [...order.events, event],
  })
}

export function syncDailyOrderFromProduction(
  daily: DailyOrder,
  productionOrders: BacklogOrder[],
): DailyOrder {
  const linked = productionOrders.filter((o) => o.pedidoDiaId === daily.id)

  const cajasAsignadas = linked
    .filter((o) => o.productionState !== 'withdrawn')
    .reduce((sum, o) => sum + o.boxes, 0)

  const cajasCompletadas = Math.min(
    cajasAsignadas,
    linked.reduce((sum, o) => sum + producedBoxesFromOrder(o), 0),
  )

  return recalcDailyOrder({
    ...daily,
    cajasAsignadas,
    cajasCompletadas,
    ordenesProduccionIds: linked.map((o) => o.id),
  })
}

function producedBoxesFromOrder(order: BacklogOrder): number {
  if (order.productionState === 'withdrawn') {
    return order.boxesProduced ?? 0
  }

  if (order.column === 'finalizado') {
    return order.boxesProduced ?? order.boxes
  }

  if (order.boxesProduced != null && order.boxesProduced > 0) {
    return Math.min(order.boxes, order.boxesProduced)
  }

  if (
    order.column === 'en_produccion' &&
    order.occupancyPercent != null &&
    order.occupancyPercent > 0
  ) {
    return Math.round(order.boxes * (order.occupancyPercent / 100))
  }

  return 0
}

export function syncAllDailyOrders(
  dailyOrders: DailyOrder[],
  productionOrders: BacklogOrder[],
): DailyOrder[] {
  return dailyOrders.map((d) => syncDailyOrderFromProduction(d, productionOrders))
}

export function buildSyncedDailyOrders(
  productionOrders: BacklogOrder[],
  dailyOrdersBase?: DailyOrder[],
): DailyOrder[] {
  const base = dailyOrdersBase ?? DEMO_DAILY_ORDER_TEMPLATES
  return syncAllDailyOrders([...base], productionOrders)
}

/** Sincroniza etiquetas de presentación desde seed sin alterar cantidades ni progreso. */
export function applyDailyOrderSeedLabels(orders: DailyOrder[]): DailyOrder[] {
  const seedById = new Map(DEMO_DAILY_ORDER_TEMPLATES.map((d) => [d.id, d]))

  return orders.map((order) => {
    const seed = seedById.get(order.id)
    if (!seed) return order

    return {
      ...order,
      variedad: seed.variedad,
      referencia: seed.referencia,
      estilo: seed.estilo,
      barcode: seed.barcode,
      producto: seed.producto,
    }
  })
}

export function isPendingAcceptanceColumn(order: BacklogOrder): boolean {
  return order.column === 'en_preparacion' && order.preparationStatus === 'pending_preparation'
}

export function isInProductionColumn(order: BacklogOrder): boolean {
  return order.column === 'en_produccion'
}

export function canConfirmCellReady(order: BacklogOrder): boolean {
  return (
    order.column === 'en_preparacion' &&
    ((order.assignedTableIds?.length ?? 0) > 0 ||
      order.preparationStatus === 'waiting_cell' ||
      order.preparationStatus === 'preparing_recipe')
  )
}

export function isCompletedProductionOrder(order: BacklogOrder): boolean {
  return order.column === 'finalizado' && order.productionState !== 'withdrawn'
}

export function orderEtc(order: BacklogOrder): string {
  return order.etc || order.eta || '—'
}
