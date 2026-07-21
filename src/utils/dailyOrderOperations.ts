import type { User } from '../types/auth'
import type { DailyOrder } from '../types/dailyOrder'
import type { BacklogOrder } from '../types/backlog'
import { isSupervisor } from './permissions'
import {
  appendDailyOrderEvent,
  recalcDailyOrder,
  syncAllDailyOrders,
} from './dailyOrderHelpers'
import { findProductByReference } from './productSearch'
import {
  findBarcodeProductionConflict,
  getConfigFromDailyOrder,
} from './referenceProductionValidation'
import {
  formatMockEtc,
  mockOccupancyPercent,
  recommendedStationCodes,
  recommendedStations,
} from './productionOrderValidation'
import { isPlantTableId } from './tableAssignment'

function audit(action: string, user = 'Sistema'): BacklogOrder['auditTrail'][0] {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    timestamp: new Date().toISOString(),
    user,
  }
}

export interface LaunchProductionOrderInput {
  pedidoDiaId: string
  boxes: number
  boxesPerHour: number
  supervisorOverride?: boolean
  overrideJustification?: string
}

export function launchProductionOrder(
  dailyOrders: DailyOrder[],
  productionOrders: BacklogOrder[],
  daily: DailyOrder,
  input: LaunchProductionOrderInput,
  user: User,
): { dailyOrders: DailyOrder[]; productionOrders: BacklogOrder[]; order: BacklogOrder | null } {
  const catalogProduct = findProductByReference(daily.referencia)
  const barcodeConflict = findBarcodeProductionConflict(
    getConfigFromDailyOrder(daily, catalogProduct),
    productionOrders,
  )
  if (barcodeConflict) {
    return { dailyOrders, productionOrders, order: null }
  }

  const { etc, endTime } = formatMockEtc(input.boxes, input.boxesPerHour)
  const stationCodes = recommendedStationCodes(input.boxes).map((station) => station.code)
  const seq = productionOrders.filter((o) => o.pedidoDiaId === daily.id).length + 1
  const refSlug = daily.referencia.replace(/^REF-/, '')
  const id = `ORD-${refSlug}-${String(seq).padStart(2, '0')}-${Date.now().toString(36).slice(2, 6)}`

  const order: BacklogOrder = {
    id,
    pedidoDiaId: daily.id,
    estilo: daily.estilo,
    barcode: daily.barcode,
    company: daily.empresa,
    reference: `ORD-${daily.referencia.replace('REF-', '')}-${String(seq).padStart(2, '0')}`,
    product: daily.producto,
    variety: daily.variedad,
    boxes: input.boxes,
    boxesPerHour: input.boxesPerHour,
    column: 'en_preparacion',
    preparationStatus: 'pending_preparation',
    etc,
    endTime,
    occupancyPercent: mockOccupancyPercent(input.boxes),
    createdBy: user.name,
    createdAt: new Date().toISOString(),
    requiredTables: recommendedStations(input.boxes),
    assignedTableIds: stationCodes.filter(isPlantTableId),
    assignedTables: stationCodes,
    assignmentMode: stationCodes.length > 0 ? 'automatic' : 'none',
    validationTables: [],
    tablesValidated: false,
    alerts: input.supervisorOverride && input.overrideJustification
      ? [`Supervisor: ${input.overrideJustification}`]
      : [],
    priority: productionOrders.filter((o) => o.column === 'en_preparacion').length + 1,
    auditTrail: [
      audit('Orden de producción creada', user.name),
      audit('Pendiente de aceptación por operario', user.name),
    ],
    events: ['lanzada'],
  }

  let nextDaily = appendDailyOrderEvent(
    daily,
    'Orden de producción lanzada',
    user.name,
    `${input.boxes.toLocaleString('es-ES')} cajas`,
  )

  const nextProduction = [...productionOrders, order]
  const syncedDaily = syncAllDailyOrders(
    dailyOrders.map((d) => (d.id === daily.id ? nextDaily : d)),
    nextProduction,
  )

  return { dailyOrders: syncedDaily, productionOrders: nextProduction, order }
}

export interface ExpandDailyOrderInput {
  pedidoDiaId: string
  additionalBoxes: number
  justification: string
}

export function expandDailyOrder(
  dailyOrders: DailyOrder[],
  input: ExpandDailyOrderInput,
  user: User,
): DailyOrder[] {
  return dailyOrders.map((d) => {
    if (d.id !== input.pedidoDiaId) return d
    const next = appendDailyOrderEvent(
      {
        ...d,
        totalCajasDia: d.totalCajasDia + input.additionalBoxes,
        estado: 'ampliado',
      },
      'Pedido del día ampliado',
      user.name,
      `${input.justification} (+${input.additionalBoxes.toLocaleString('es-ES')} cajas)`,
    )
    return recalcDailyOrder(next)
  })
}

export function applyWithdrawToDailyOrder(
  dailyOrders: DailyOrder[],
  productionOrders: BacklogOrder[],
  orderId: string,
  producedBoxes: number,
  user: User,
): DailyOrder[] {
  const order = productionOrders.find((o) => o.id === orderId)
  if (!order?.pedidoDiaId) return dailyOrders

  return syncAllDailyOrders(
    dailyOrders.map((d) => {
      if (d.id !== order.pedidoDiaId) return d
      const unproduced = Math.max(0, order.boxes - producedBoxes)
      return appendDailyOrderEvent(
        d,
        'Orden retirada de producción',
        user.name,
        `${producedBoxes.toLocaleString('es-ES')} cajas producidas; ${unproduced.toLocaleString('es-ES')} devueltas a restante`,
      )
    }),
    productionOrders,
  )
}

export function canLaunchOverRemaining(user: User, boxes: number, remaining: number): boolean {
  if (boxes <= remaining) return true
  return isSupervisor(user)
}

export interface CreateDailyOrderInput {
  estilo: string
  referencia: string
  barcode: string
  variedad: string
  producto?: string
  empresa: DailyOrder['empresa']
  fecha?: string
  observaciones?: string
  totalCajasDia: number
}

export function createDailyOrder(
  dailyOrders: DailyOrder[],
  input: CreateDailyOrderInput,
  user: User,
): { dailyOrders: DailyOrder[]; order: DailyOrder } {
  const id = `pd-${Date.now().toString(36).slice(2, 8)}`
  const fecha = input.fecha?.trim() || new Date().toISOString().slice(0, 10)
  const totalCajas = Math.max(0, input.totalCajasDia)
  const detailParts = [input.variedad.trim(), input.observaciones?.trim()].filter(Boolean)
  const totalLabel = `${totalCajas.toLocaleString('es-ES')} cajas`

  const order: DailyOrder = recalcDailyOrder({
    id,
    fecha,
    estilo: input.estilo.trim(),
    referencia: input.referencia.trim(),
    barcode: input.barcode.trim(),
    empresa: input.empresa,
    producto: input.producto?.trim() || 'Naranja',
    variedad: input.variedad.trim(),
    totalCajasDia: totalCajas,
    cajasAsignadas: 0,
    cajasCompletadas: 0,
    cajasRestantes: 0,
    porcentajeAsignado: 0,
    porcentajeCompletado: 0,
    porcentajeRestante: 0,
    estado: 'pendiente',
    ordenesProduccionIds: [],
    events: [
      {
        id: `ev-${Date.now()}`,
        at: new Date().toISOString(),
        action: 'Pedido del día creado',
        user: user.name,
        detail: [totalLabel, ...detailParts].filter(Boolean).join(' · ') || input.estilo.trim(),
      },
    ],
  })

  return { dailyOrders: [...dailyOrders, order], order }
}
