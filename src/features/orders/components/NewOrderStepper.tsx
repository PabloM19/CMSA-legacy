import { Check } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'

export function NewOrderStepper({ confirming = false }: { confirming?: boolean }) {
  const { t } = useLanguage()
  const d = t.newOrder

  return (
    <nav className="new-order-stepper" aria-label={d.stepperLabel}>
      <ol className="new-order-stepper__list">
        <li
          className={`new-order-stepper__item${confirming ? ' new-order-stepper__item--done' : ' new-order-stepper__item--active'}`}
        >
          <span className="new-order-stepper__marker" aria-hidden="true">
            {confirming ? <Check size={16} strokeWidth={2.5} /> : 1}
          </span>
          <span className="new-order-stepper__label">{d.step1Title}</span>
        </li>
        <li
          className={`new-order-stepper__item${confirming ? ' new-order-stepper__item--active' : ' new-order-stepper__item--ghost'}`}
        >
          <span className="new-order-stepper__marker" aria-hidden="true">
            {confirming ? 2 : <Check size={16} strokeWidth={2.5} />}
          </span>
          <span className="new-order-stepper__label">{d.stepConfirmTitle}</span>
        </li>
      </ol>
    </nav>
  )
}
