import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantMapViewFilter } from '../../../utils/plantMapViewFilter'

interface PlantMapViewFilterBarProps {
  value: PlantMapViewFilter
  onChange: (value: PlantMapViewFilter) => void
}

const FILTERS: PlantMapViewFilter[] = ['all', 'free', 'with_events', 'in_production']

export function PlantMapViewFilterBar({ value, onChange }: PlantMapViewFilterBarProps) {
  const { t } = useLanguage()
  const d = t.plantMap

  const labels: Record<PlantMapViewFilter, string> = {
    all: d.viewFilterAll,
    free: d.viewFilterFree,
    with_events: d.viewFilterEvents,
    in_production: d.viewFilterProduction,
  }

  return (
    <div className="plant-map-view-filter admin-filter-bar" role="group" aria-label={d.viewFilterLabel}>
      {FILTERS.map((id) => (
        <button
          key={id}
          type="button"
          className={`admin-filter-bar__btn${value === id ? ' admin-filter-bar__btn--active' : ''}`}
          onClick={() => onChange(id)}
        >
          {labels[id]}
        </button>
      ))}
    </div>
  )
}
