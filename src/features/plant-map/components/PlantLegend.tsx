import {
  AlertTriangle,
  Ban,
  Bot,
  Lock,
  Package,
  PauseCircle,
  TrendingDown,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'

const ICON_SIZE = 14

export function PlantLegend() {
  const { t } = useLanguage()
  const d = t.plantMap

  const companyItems = [
    { className: 'plant-legend__chip-swatch plant-legend__chip-swatch--sumo', label: d.legendSumoStripe },
    { className: 'plant-legend__chip-swatch plant-legend__chip-swatch--maf', label: d.legendMafStripe },
  ]

  const typeItems = [
    {
      key: 'robot',
      icon: <Bot size={ICON_SIZE} aria-hidden="true" />,
      label: d.legendTypeRobot,
    },
    {
      key: 'palletizer',
      icon: <Package size={ICON_SIZE} aria-hidden="true" />,
      label: d.legendTypePalletizer,
    },
    {
      key: 'manual',
      icon: <UserRound size={ICON_SIZE} aria-hidden="true" />,
      label: d.legendTypeManual,
    },
  ]

  const colorItems = [
    { className: 'plant-legend__chip-swatch plant-legend__chip-swatch--occupied', label: d.legendOccupied },
    { className: 'plant-legend__chip-swatch plant-legend__chip-swatch--waiting', label: d.legendColorWaiting },
    { className: 'plant-legend__chip-swatch plant-legend__chip-swatch--blocked', label: d.legendColorBlocked },
    {
      className: 'plant-legend__chip-swatch plant-legend__chip-swatch--critical',
      label: d.legendColorCriticalBlink,
    },
    { className: 'plant-legend__chip-swatch plant-legend__chip-swatch--preparing', label: d.legendColorPreparing },
    { className: 'plant-legend__chip-swatch plant-legend__chip-swatch--disabled', label: d.legendDisabled },
    { className: 'plant-legend__chip-swatch plant-legend__chip-swatch--free', label: d.legendFree },
  ]

  const topIcons = [
    {
      key: 'slow',
      icon: <TrendingDown size={ICON_SIZE} aria-hidden="true" />,
      label: d.legendIconSlow,
    },
    {
      key: 'fast',
      icon: <TrendingUp size={ICON_SIZE} aria-hidden="true" />,
      label: d.legendIconFast,
    },
  ]

  const bottomIcons = [
    {
      key: 'event',
      icon: <AlertTriangle size={ICON_SIZE} aria-hidden="true" />,
      label: d.legendIconEvent,
    },
    {
      key: 'pause',
      icon: <PauseCircle size={ICON_SIZE} aria-hidden="true" />,
      label: d.legendIconPause,
    },
    {
      key: 'lock',
      icon: <Lock size={ICON_SIZE} aria-hidden="true" />,
      label: d.legendIconLock,
    },
    {
      key: 'block',
      icon: <Ban size={ICON_SIZE} aria-hidden="true" />,
      label: d.legendIconSafety,
    },
  ]

  return (
    <section className="plant-legend plant-legend--compact dash-card" aria-label={d.legendTitle}>
      <h2 className="plant-legend__compact-title">{d.legendTitle}</h2>
      <p className="plant-legend__placement-note">{d.legendIconPlacementNote}</p>

      <div className="plant-legend__compact-row">
        <span className="plant-legend__icon-group-label">{d.legendTypesLabel}</span>
        {typeItems.map((item) => (
          <span key={item.key} className="plant-legend__chip plant-legend__chip--icon">
            <span className="plant-legend__chip-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </span>
        ))}
      </div>

      <div className="plant-legend__compact-row">
        {companyItems.map((item) => (
          <span key={item.label} className="plant-legend__chip">
            <span className={item.className} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>

      <div className="plant-legend__compact-row">
        {colorItems.map((item) => (
          <span key={item.label} className="plant-legend__chip">
            <span className={item.className} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>

      <div className="plant-legend__compact-row plant-legend__compact-row--icons">
        <span className="plant-legend__icon-group-label">{d.legendIconsTopLabel}</span>
        {topIcons.map((item) => (
          <span key={item.key} className="plant-legend__chip plant-legend__chip--icon">
            <span className="plant-legend__chip-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </span>
        ))}
      </div>

      <div className="plant-legend__compact-row plant-legend__compact-row--icons">
        <span className="plant-legend__icon-group-label">{d.legendIconsBottomLabel}</span>
        {bottomIcons.map((item) => (
          <span key={item.key} className="plant-legend__chip plant-legend__chip--icon">
            <span className="plant-legend__chip-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </span>
        ))}
      </div>
    </section>
  )
}
