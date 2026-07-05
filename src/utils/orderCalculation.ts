import type { Lang } from '../i18n/translations'
import type {
  NewOrderFormData,
  NewOrderFormErrors,
  OrderCalculation,
} from '../types/newOrder'
import {
  validateBoxesPerHour,
  validateProductionOrderBoxes,
} from './productionOrderValidation'

export function validateNewOrderForm(
  data: NewOrderFormData,
  lang: Lang,
): NewOrderFormErrors {
  const errors: NewOrderFormErrors = {}
  const msg =
    lang === 'es'
      ? {
          required: 'Campo obligatorio',
          boxesMin: 'Debe ser mayor que 0',
          rateMin: 'Debe ser mayor que 0',
          noNegative: 'No se permiten valores negativos',
        }
      : {
          required: 'Required field',
          boxesMin: 'Must be greater than 0',
          rateMin: 'Must be greater than 0',
          noNegative: 'Negative values are not allowed',
        }

  if (!data.product.trim()) errors.product = msg.required
  if (!data.variety.trim()) errors.variety = msg.required

  const boxes = Number(data.boxes)
  if (!data.boxes.trim()) {
    errors.boxes = msg.required
  } else if (Number.isNaN(boxes) || boxes < 0) {
    errors.boxes = msg.noNegative
  } else if (boxes <= 0) {
    errors.boxes = msg.boxesMin
  }

  const rate = Number(data.boxesPerHour)
  if (!data.boxesPerHour.trim()) {
    errors.boxesPerHour = msg.required
  } else if (Number.isNaN(rate) || rate < 0) {
    errors.boxesPerHour = msg.noNegative
  } else if (rate <= 0) {
    errors.boxesPerHour = msg.rateMin
  }

  return errors
}

export function hasFormErrors(errors: NewOrderFormErrors): boolean {
  return Object.keys(errors).length > 0
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function calculateOrder(
  boxes: number,
  boxesPerHour: number,
  lang: Lang,
): OrderCalculation {
  const boxCheck = validateProductionOrderBoxes(boxes, lang)
  const rateCheck = validateBoxesPerHour(boxesPerHour, lang)

  const alerts: OrderCalculation['alerts'] = [
    ...boxCheck.warnings.map((message) => ({
      type: (boxCheck.blocked ? 'critical' : 'warning') as 'warning' | 'critical',
      message,
    })),
    ...rateCheck.warnings.map((message) => ({
      type: (rateCheck.blocked ? 'critical' : 'warning') as 'warning' | 'critical',
      message,
    })),
  ]

  const blocked = boxCheck.blocked || rateCheck.blocked
  const blockReason = alerts.find((a) => a.type === 'critical')?.message

  const requiredTables = Math.max(2, Math.ceil(boxes / 4000))
  const durationHours = boxes / Math.max(boxesPerHour, 1)
  const durationMinutes = Math.round(durationHours * 60)
  const now = new Date()
  const etcDate = addMinutes(now, 30)
  const endDate = addMinutes(etcDate, durationMinutes)
  const capacityConsumed = Math.min(100, Math.round((boxes / 20_000) * 100))
  const etc = formatTime(etcDate)

  return {
    requiredTables,
    etc,
    eta: etc,
    estimatedEnd: formatTime(endDate),
    capacityConsumed,
    alerts,
    blocked,
    blockReason,
  }
}
