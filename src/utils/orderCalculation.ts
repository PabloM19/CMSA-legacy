import type { Lang } from '../i18n/translations'
import type {
  NewOrderFormData,
  NewOrderFormErrors,
  OrderCalculation,
} from '../types/newOrder'

interface AlertMessages {
  overload: string
  slowFlow: string
  fastFlow: string
  incompleteLayer: string
}

function getAlertMessages(lang: Lang): AlertMessages {
  return lang === 'es'
    ? {
        overload: 'Sobrecarga: el volumen supera el límite operativo (5.000 cajas).',
        slowFlow: 'Aviso: flujo lento (< 100 cajas/h).',
        fastFlow: 'Aviso: flujo rápido (> 800 cajas/h).',
        incompleteLayer: 'Aviso: capa incompleta — las cajas no son múltiplo de 8.',
      }
    : {
        overload: 'Overload: volume exceeds operational limit (5,000 boxes).',
        slowFlow: 'Warning: slow flow (< 100 boxes/h).',
        fastFlow: 'Warning: fast flow (> 800 boxes/h).',
        incompleteLayer: 'Warning: incomplete layer — boxes are not a multiple of 8.',
      }
}

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

  if (!data.reference.trim()) errors.reference = msg.required
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
  const alerts: OrderCalculation['alerts'] = []
  const messages = getAlertMessages(lang)

  let blocked = false
  let blockReason: string | undefined

  if (boxes > 5000) {
    blocked = true
    blockReason = messages.overload
    alerts.push({ type: 'critical', message: messages.overload })
  }

  if (boxesPerHour < 100) {
    alerts.push({ type: 'warning', message: messages.slowFlow })
  }

  if (boxesPerHour > 800) {
    alerts.push({ type: 'warning', message: messages.fastFlow })
  }

  if (boxes % 8 !== 0) {
    alerts.push({ type: 'warning', message: messages.incompleteLayer })
  }

  const requiredTables = Math.max(1, Math.ceil(boxes / 1200))
  const durationHours = boxes / boxesPerHour
  const durationMinutes = Math.round(durationHours * 60)
  const now = new Date()
  const etaDate = addMinutes(now, 30)
  const endDate = addMinutes(etaDate, durationMinutes)
  const capacityConsumed = Math.min(100, Math.round((boxes / 5000) * 100))

  return {
    requiredTables,
    eta: formatTime(etaDate),
    estimatedEnd: formatTime(endDate),
    capacityConsumed,
    alerts,
    blocked,
    blockReason,
  }
}
