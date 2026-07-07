import type { Lang } from '../i18n/translations'
import type { NewOrderFormData, NewOrderFormErrors } from '../types/newOrder'

export type OrderSummaryStatus = 'incomplete' | 'ready'

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

export function getSummaryStatus(form: NewOrderFormData): OrderSummaryStatus {
  const step1Ok =
    form.productId.trim() !== '' &&
    form.productReference.trim() !== '' &&
    form.product.trim() !== '' &&
    form.variety.trim() !== ''

  return step1Ok ? 'ready' : 'incomplete'
}

export function getStepHint(form: NewOrderFormData, lang: Lang): string | null {
  const es = lang === 'es'
  if (
    !form.productId.trim() ||
    !form.productReference.trim() ||
    !form.product.trim() ||
    !form.variety.trim()
  ) {
    return es
      ? 'Selecciona un producto del catálogo para continuar.'
      : 'Select a catalog product to continue.'
  }
  return null
}
