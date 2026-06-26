import { useLanguage } from '../../../i18n/LanguageContext'

export function PlantLegend() {
  const { t } = useLanguage()
  const d = t.plantMap

  const items = [
    { className: 'plant-legend__swatch plant-legend__swatch--sumo', label: d.legendSumo },
    { className: 'plant-legend__swatch plant-legend__swatch--maf', label: d.legendMaf },
    { className: 'plant-legend__swatch plant-legend__swatch--free', label: d.legendFree },
    { className: 'plant-legend__swatch plant-legend__swatch--pending', label: d.legendPending },
    { className: 'plant-legend__swatch plant-legend__swatch--occupied', label: d.legendOccupied },
    { className: 'plant-legend__swatch plant-legend__swatch--waiting', label: d.legendWaiting },
    { className: 'plant-legend__swatch plant-legend__swatch--blocked', label: d.legendBlocked },
    { className: 'plant-legend__swatch plant-legend__swatch--conflict', label: d.legendConflict },
    { className: 'plant-legend__swatch plant-legend__swatch--slow', label: d.legendSlow },
    { className: 'plant-legend__swatch plant-legend__swatch--normal', label: d.legendNormal },
    { className: 'plant-legend__swatch plant-legend__swatch--fast', label: d.legendFast },
  ]

  return (
    <section className="plant-legend dash-card" aria-label={d.legendTitle}>
      <h2 className="plant-legend__title">{d.legendTitle}</h2>
      <ul className="plant-legend__list">
        {items.map((item) => (
          <li key={item.label} className="plant-legend__item">
            <span className={item.className} aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
