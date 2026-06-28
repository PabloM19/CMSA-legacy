import type { Lang } from '../i18n/translations'
import type { NewOrderFormData, NewOrderFormErrors, OrderCalculation } from '../types/newOrder'

export type NewOrderWizardStep = 1 | 2 | 3
export type OrderSummaryStatus = 'incomplete' | 'readyToCalculate' | 'calculated' | 'blocked'
export type AssignmentDisplayType = 'automatic' | 'manual' | 'mixed'

export const RATE_SHORTCUTS = [100, 500, 800] as const

export function validateStep1(data: NewOrderFormData, lang: Lang): NewOrderFormErrors {
  const errors: NewOrderFormErrors = {}
  const required = lang === 'es' ? 'Campo obligatorio' : 'Required field'
  const selectProduct =
    lang === 'es'
      ? 'Selecciona un producto del catálogo para continuar.'
      : 'Select a product from the catalog to continue.'

  if (!data.productReference.trim() && !data.productId.trim()) {
    errors.productId = selectProduct
  }
  if (!data.product.trim()) errors.product = required
  if (!data.variety.trim()) errors.variety = required

  return errors
}

export function validateStep2(data: NewOrderFormData, lang: Lang): NewOrderFormErrors {
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

export function getSummaryStatus(
  form: NewOrderFormData,
  calculation: OrderCalculation | null,
): OrderSummaryStatus {
  if (calculation?.blocked) return 'blocked'
  if (calculation) return 'calculated'

  const step1Ok =
    form.productId.trim() !== '' &&
    form.productReference.trim() !== '' &&
    form.product.trim() !== '' &&
    form.variety.trim() !== ''
  const boxes = Number(form.boxes)
  const rate = Number(form.boxesPerHour)
  const step2Ok = boxes > 0 && rate > 0

  if (step1Ok && step2Ok) return 'readyToCalculate'
  return 'incomplete'
}

export function getAssignmentDisplayType(calculation: OrderCalculation): AssignmentDisplayType {
  if (calculation.requiredTables <= 1) return 'automatic'
  if (calculation.requiredTables >= 3) return 'mixed'
  return 'manual'
}

export function mayRequireManualTables(calculation: OrderCalculation): boolean {
  return calculation.requiredTables >= 2
}

export function getStepHint(
  step: NewOrderWizardStep,
  form: NewOrderFormData,
  lang: Lang,
): string | null {
  const es = lang === 'es'
  if (step === 1) {
    if (!form.productId.trim() || !form.productReference.trim() || !form.product.trim() || !form.variety.trim()) {
      return es
        ? 'Selecciona un producto del catálogo para continuar.'
        : 'Select a catalog product to continue.'
    }
  }
  if (step === 2) {
    const boxes = Number(form.boxes)
    const rate = Number(form.boxesPerHour)
    if (!(boxes > 0) || !(rate > 0)) {
      return es
        ? 'Introduce cajas y cajas/hora para calcular.'
        : 'Enter boxes and boxes/hour to calculate.'
    }
  }
  return null
}
