import { FormField, Input } from '../../../components/ui/FormField'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { NewOrderFormData, NewOrderFormErrors } from '../../../types/newOrder'
import { RATE_SHORTCUTS } from '../../../utils/newOrderViewHelpers'

interface NewOrderStep2Props {
  form: NewOrderFormData
  errors: NewOrderFormErrors
  onChange: <K extends keyof NewOrderFormData>(key: K, value: NewOrderFormData[K]) => void
}

export function NewOrderStep2({ form, errors, onChange }: NewOrderStep2Props) {
  const { t } = useLanguage()
  const d = t.newOrder

  return (
    <section className="new-order-step dash-card">
      <header className="new-order-step__head">
        <h2 className="new-order-step__title">{d.step2Title}</h2>
        <p className="new-order-step__desc">{d.step2Desc}</p>
      </header>

      <div className="new-order-step__grid new-order-step__grid--single">
        <FormField
          label={`${d.boxes} *`}
          htmlFor="boxes"
          hint={d.boxesExample}
          error={errors.boxes}
        >
          <Input
            id="boxes"
            type="number"
            min={0}
            step={1}
            hasError={Boolean(errors.boxes)}
            value={form.boxes}
            onChange={(e) => onChange('boxes', e.target.value)}
          />
        </FormField>

        <FormField
          label={`${d.boxesPerHour} *`}
          htmlFor="boxesPerHour"
          hint={d.rateExample}
          error={errors.boxesPerHour}
        >
          <Input
            id="boxesPerHour"
            type="number"
            min={0}
            step={1}
            hasError={Boolean(errors.boxesPerHour)}
            value={form.boxesPerHour}
            onChange={(e) => onChange('boxesPerHour', e.target.value)}
          />
          <div className="new-order-rate-shortcuts">
            <span className="new-order-rate-shortcuts__label">{d.rateShortcutsLabel}</span>
            <div className="new-order-rate-shortcuts__buttons">
              {RATE_SHORTCUTS.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  className={`new-order-rate-chip${form.boxesPerHour === String(rate) ? ' new-order-rate-chip--active' : ''}`}
                  onClick={() => onChange('boxesPerHour', String(rate))}
                >
                  {rate}
                </button>
              ))}
            </div>
          </div>
        </FormField>
      </div>
    </section>
  )
}
