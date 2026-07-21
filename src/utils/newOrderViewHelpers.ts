import type { Lang } from '../i18n/translations'
import type { NewOrderFormData, NewOrderFormErrors } from '../types/newOrder'

export type OrderSummaryStatus = 'incomplete' | 'ready'

function validationMessages(lang: Lang) {
  return lang === 'es'
    ? {
        required: 'Campo obligatorio',
        selectProduct: 'Selecciona un producto del catálogo para continuar.',
        boxesMin: 'Indica un total mayor que 0',
        boxesInvalid: 'Introduce un número válido de cajas',
        boxesHint: 'Indica el total de cajas a producir para continuar.',
      }
    : {
        required: 'Required field',
        selectProduct: 'Select a product from the catalog to continue.',
        boxesMin: 'Enter a total greater than 0',
        boxesInvalid: 'Enter a valid number of boxes',
        boxesHint: 'Enter the total boxes to produce to continue.',
      }
}

export function validateStep1(data: NewOrderFormData, lang: Lang): NewOrderFormErrors {
  const errors: NewOrderFormErrors = {}
  const msg = validationMessages(lang)

  if (!data.productId.trim()) {
    errors.productId = msg.selectProduct
  }
  if (!data.product.trim()) errors.product = msg.required
  if (!data.variety.trim()) errors.variety = msg.required

  return errors
}

export function validateTotalBoxes(data: NewOrderFormData, lang: Lang): NewOrderFormErrors {
  const errors: NewOrderFormErrors = {}
  const msg = validationMessages(lang)

  if (!data.boxes.trim()) {
    errors.boxes = msg.required
    return errors
  }

  const boxes = Number(data.boxes)
  if (Number.isNaN(boxes)) {
    errors.boxes = msg.boxesInvalid
  } else if (boxes <= 0) {
    errors.boxes = msg.boxesMin
  }

  return errors
}

export function validateBeforeConfirm(data: NewOrderFormData, lang: Lang): NewOrderFormErrors {
  return { ...validateStep1(data, lang), ...validateTotalBoxes(data, lang) }
}

export function getSummaryStatus(form: NewOrderFormData): OrderSummaryStatus {
  const step1Ok =
    form.productId.trim() !== '' &&
    form.productReference.trim() !== '' &&
    form.product.trim() !== '' &&
    form.variety.trim() !== ''

  const boxes = Number(form.boxes)
  const boxesOk = form.boxes.trim() !== '' && !Number.isNaN(boxes) && boxes > 0

  return step1Ok && boxesOk ? 'ready' : 'incomplete'
}

export function getStepHint(form: NewOrderFormData, lang: Lang): string | null {
  const msg = validationMessages(lang)

  if (
    !form.productId.trim() ||
    !form.productReference.trim() ||
    !form.product.trim() ||
    !form.variety.trim()
  ) {
    return msg.selectProduct
  }

  if (!form.boxes.trim() || Number(form.boxes) <= 0 || Number.isNaN(Number(form.boxes))) {
    return msg.boxesHint
  }

  return null
}
