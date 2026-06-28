import { useLanguage } from '../../../i18n/LanguageContext'
import type { ValidationFilter } from '../../../utils/validationViewHelpers'

interface ValidationFilterChipsProps {
  active: ValidationFilter
  onChange: (filter: ValidationFilter) => void
}

const FILTERS: ValidationFilter[] = ['all', 'pending', 'conflict', 'ready']

const FILTER_LABEL = {
  all: 'filterAll',
  pending: 'filterPending',
  conflict: 'filterConflict',
  ready: 'filterReady',
} as const

export function ValidationFilterChips({ active, onChange }: ValidationFilterChipsProps) {
  const { t } = useLanguage()
  const d = t.validation

  return (
    <div className="validation-filters" role="tablist" aria-label={d.filterLabel}>
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          role="tab"
          aria-selected={active === filter}
          className={`validation-filter-chip${active === filter ? ' validation-filter-chip--active' : ''}`}
          onClick={() => onChange(filter)}
        >
          {d[FILTER_LABEL[filter]]}
        </button>
      ))}
    </div>
  )
}
