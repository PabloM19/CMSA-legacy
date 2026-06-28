import {
  AlertTriangle,
  Check,
  Clock,
  OctagonAlert,
  Pause,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'

const ICON_LEGEND_SIZE = 18

export function PlantLegend() {
  const { t } = useLanguage()
  const d = t.plantMap

  const colorItems = [
    { className: 'plant-legend__swatch plant-legend__swatch--sumo', label: d.legendSumo },
    { className: 'plant-legend__swatch plant-legend__swatch--maf', label: d.legendMaf },
    { className: 'plant-legend__swatch plant-legend__swatch--free', label: d.legendFree },
    { className: 'plant-legend__swatch plant-legend__swatch--pending', label: d.legendPending },
    { className: 'plant-legend__swatch plant-legend__swatch--occupied', label: d.legendOccupied },
    { className: 'plant-legend__swatch plant-legend__swatch--waiting', label: d.iconWaitShort },
    { className: 'plant-legend__swatch plant-legend__swatch--blocked', label: d.iconBlockedShort },
  ]

  const iconItems = [
    { key: 'slow', content: <span className="plant-legend__emoji" aria-hidden="true">🐢</span>, label: d.iconSlowLong },
    { key: 'fast', content: <span className="plant-legend__emoji" aria-hidden="true">🐇</span>, label: d.iconFastLong },
    {
      key: 'warn',
      content: <AlertTriangle size={ICON_LEGEND_SIZE} aria-hidden="true" />,
      label: d.iconWarningLong,
    },
    {
      key: 'wait',
      content: <Pause size={ICON_LEGEND_SIZE} aria-hidden="true" />,
      label: d.iconWaitLong,
    },
    {
      key: 'check',
      content: <Check size={ICON_LEGEND_SIZE} aria-hidden="true" />,
      label: d.iconCheckLegend,
    },
    {
      key: 'block',
      content: <OctagonAlert size={ICON_LEGEND_SIZE} aria-hidden="true" />,
      label: d.iconBlockedLong,
    },
    {
      key: 'clock',
      content: <Clock size={ICON_LEGEND_SIZE} aria-hidden="true" />,
      label: d.iconClockLong,
    },
  ]

  return (
    <section className="plant-legend dash-card" aria-label={d.legendTitle}>
      <div className="plant-legend__section">
        <h2 className="plant-legend__title">{d.colorLegendTitle}</h2>
        <ul className="plant-legend__list">
          {colorItems.map((item) => (
            <li key={item.label} className="plant-legend__item">
              <span className={item.className} aria-hidden="true" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="plant-legend__section plant-legend__section--icons">
        <h2 className="plant-legend__title">{d.iconLegendTitle}</h2>
        <ul className="plant-legend__icon-list">
          {iconItems.map((item) => (
            <li key={item.key} className="plant-legend__icon-item">
              <span className="plant-legend__icon-mark" aria-hidden="true">
                {item.content}
              </span>
              <span className="plant-legend__icon-text">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
