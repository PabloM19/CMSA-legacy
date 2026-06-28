import { Check } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderWizardStep } from '../../../utils/newOrderViewHelpers'

interface NewOrderStepperProps {
  currentStep: NewOrderWizardStep
}

const STEPS: NewOrderWizardStep[] = [1, 2, 3]

const STEP_LABEL = {
  1: 'step1Title',
  2: 'step2Title',
  3: 'step3Title',
} as const

export function NewOrderStepper({ currentStep }: NewOrderStepperProps) {
  const { t } = useLanguage()
  const d = t.newOrder

  return (
    <nav className="new-order-stepper" aria-label={d.stepperLabel}>
      <ol className="new-order-stepper__list">
        {STEPS.map((step) => {
          const done = step < currentStep
          const active = step === currentStep
          return (
            <li
              key={step}
              className={`new-order-stepper__item${active ? ' new-order-stepper__item--active' : ''}${done ? ' new-order-stepper__item--done' : ''}`}
            >
              <span className="new-order-stepper__marker" aria-hidden="true">
                {done ? <Check size={16} strokeWidth={2.5} /> : step}
              </span>
              <span className="new-order-stepper__label">{d[STEP_LABEL[step]]}</span>
            </li>
          )
        })}
        <li className="new-order-stepper__item new-order-stepper__item--ghost">
          <span className="new-order-stepper__marker" aria-hidden="true">
            4
          </span>
          <span className="new-order-stepper__label">{d.step4Title}</span>
        </li>
      </ol>
    </nav>
  )
}
