import { DEMO_LIMITS } from '../config/demoLimits'
import type { BacklogOrder } from '../types/backlog'
import { formatTableList, resolveAssignedTableIds } from './tableAssignment'
import type { LimitCheck } from '../config/demoLimits'

function layerWarning(lang: Lang, boxes: number): string | null {
  if (boxes % DEMO_LIMITS.layerMultiple !== 0) {
    return lang === 'es'
      ? 'Las cajas no completan una capa de 10. Puede quedar en espera temporal.'
      : 'Boxes do not complete a layer of 10. May remain on temporary hold.'
  }
  return null
}

export function validateProductionOrderBoxes(
  boxes: number,
  lang: Lang,
): LimitCheck {
  const warnings: string[] = []
  let blocked = false

  if (boxes <= 0) {
    return { blocked: true, warnings: [lang === 'es' ? 'Debe ser mayor que 0' : 'Must be greater than 0'] }
  }

  if (boxes > DEMO_LIMITS.productionOrder.block) {
    blocked = true
    warnings.push(
      lang === 'es'
        ? `Volumen bloqueado: supera ${DEMO_LIMITS.productionOrder.block.toLocaleString('es-ES')} cajas (mock).`
        : `Blocked: exceeds ${DEMO_LIMITS.productionOrder.block.toLocaleString()} boxes (mock).`,
    )
  } else if (boxes > DEMO_LIMITS.productionOrder.warnHigh) {
    warnings.push(
      lang === 'es'
        ? `Volumen alto: más de ${DEMO_LIMITS.productionOrder.warnHigh.toLocaleString('es-ES')} cajas.`
        : `High volume: over ${DEMO_LIMITS.productionOrder.warnHigh.toLocaleString()} boxes.`,
    )
  }

  const layer = layerWarning(lang, boxes)
  if (layer) warnings.push(layer)

  return { blocked, warnings }
}

export function validateBoxesPerHour(rate: number, lang: Lang): LimitCheck {
  const warnings: string[] = []
  let blocked = false

  if (rate <= 0) {
    return { blocked: true, warnings: [lang === 'es' ? 'Debe ser mayor que 0' : 'Must be greater than 0'] }
  }

  if (rate > DEMO_LIMITS.boxesPerHour.block) {
    blocked = true
    warnings.push(
      lang === 'es'
        ? `Ritmo bloqueado: supera ${DEMO_LIMITS.boxesPerHour.block.toLocaleString('es-ES')} cajas/h (mock).`
        : `Blocked rate: exceeds ${DEMO_LIMITS.boxesPerHour.block.toLocaleString()} boxes/h (mock).`,
    )
  } else if (rate > DEMO_LIMITS.boxesPerHour.warnHigh) {
    warnings.push(
      lang === 'es'
        ? `Ritmo alto: más de ${DEMO_LIMITS.boxesPerHour.warnHigh.toLocaleString('es-ES')} cajas/h.`
        : `High rate: over ${DEMO_LIMITS.boxesPerHour.warnHigh.toLocaleString()} boxes/h.`,
    )
  } else if (rate < DEMO_LIMITS.boxesPerHour.normalMin) {
    warnings.push(
      lang === 'es'
        ? `Ritmo bajo: menos de ${DEMO_LIMITS.boxesPerHour.normalMin.toLocaleString('es-ES')} cajas/h.`
        : `Low rate: under ${DEMO_LIMITS.boxesPerHour.normalMin.toLocaleString()} boxes/h.`,
    )
  }

  return { blocked, warnings }
}

export function validateDailyOrderTotal(total: number, lang: Lang): LimitCheck {
  const warnings: string[] = []
  let blocked = false

  if (total > DEMO_LIMITS.dailyOrder.block) {
    blocked = true
    warnings.push(
      lang === 'es'
        ? `Total bloqueado: supera ${DEMO_LIMITS.dailyOrder.block.toLocaleString('es-ES')} cajas (mock).`
        : `Blocked total: exceeds ${DEMO_LIMITS.dailyOrder.block.toLocaleString()} boxes (mock).`,
    )
  } else if (total > DEMO_LIMITS.dailyOrder.warnHigh) {
    warnings.push(
      lang === 'es'
        ? `Total alto: más de ${DEMO_LIMITS.dailyOrder.warnHigh.toLocaleString('es-ES')} cajas.`
        : `High total: over ${DEMO_LIMITS.dailyOrder.warnHigh.toLocaleString()} boxes.`,
    )
  }

  return { blocked, warnings }
}

export function canExceedRemainingBoxes(isSupervisorRole: boolean): boolean {
  return isSupervisorRole
}

export function formatMockEtc(boxes: number, boxesPerHour: number): { etc: string; endTime: string } {
  const durationHours = boxes / Math.max(boxesPerHour, 1)
  const durationMinutes = Math.round(durationHours * 60)
  const now = new Date()
  const etcDate = new Date(now.getTime() + 30 * 60_000)
  const endDate = new Date(etcDate.getTime() + durationMinutes * 60_000)
  const fmt = (d: Date) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return { etc: fmt(etcDate), endTime: fmt(endDate) }
}

export function recommendedStations(boxes: number): number {
  return Math.max(2, Math.ceil(boxes / 4000))
}

export type RecommendedStationCode = {
  code: string
  type: 'manual' | 'automatic' | 'palletizer'
}

/** Estaciones concretas mock para el preview de lanzamiento (solo visualización). */
export function recommendedStationCodes(boxes: number): RecommendedStationCode[] {
  const count = recommendedStations(boxes)
  const result: RecommendedStationCode[] = [{ code: 'M2', type: 'manual' }]
  const automatic = ['R3', 'R4', 'R5', 'R6', 'R7', 'R8']
  const palletizers = ['P5', 'P4', 'P6', 'P3']

  if (count <= 1) return result.slice(0, count)

  if (count === 2) {
    result.push({ code: automatic[0], type: 'automatic' })
    return result
  }

  const automaticCount = count >= 4 ? count - 2 : count - 1
  for (let i = 0; i < automaticCount && i < automatic.length; i += 1) {
    result.push({ code: automatic[i], type: 'automatic' })
  }

  if (count >= 4) {
    result.push({ code: palletizers[0], type: 'palletizer' })
  }

  return result.slice(0, count)
}

/** Mesas concretas de la orden: asignadas o, si aún no hay, las recomendadas al lanzar. */
export function resolveOrderStationCodes(order: BacklogOrder): string[] {
  const assigned = resolveAssignedTableIds(order)
  if (assigned.length > 0) return assigned
  return recommendedStationCodes(order.boxes).map((station) => station.code)
}

export function formatOrderStationList(order: BacklogOrder): string {
  return formatTableList(resolveOrderStationCodes(order))
}

export function mockOccupancyPercent(boxes: number): number {
  return Math.min(100, Math.round((boxes / 20_000) * 100))
}
