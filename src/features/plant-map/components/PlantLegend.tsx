import { useId, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lock,
  Package,
  PauseCircle,
  TrendingDown,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import {
  PLANT_LEGEND_CLOSE_ARIA,
  PLANT_LEGEND_COLLAPSED_SUMMARY,
  PLANT_LEGEND_ICON_BLOCK,
  PLANT_LEGEND_OPEN_ARIA,
  PLANT_LEGEND_SECTION_COMPANY,
  PLANT_LEGEND_SECTION_STATES,
} from './plantLegendCopy'
import { RobotArmIcon } from './RobotArmIcon'

const ICON_SIZE = 16

interface LegendChipItem {
  key: string
  label: string
  swatchClassName?: string
  icon?: ReactNode
}

interface LegendRowProps {
  label: string
  items: LegendChipItem[]
  withDivider?: boolean
}

function LegendChip({ swatchClassName, icon, label }: Omit<LegendChipItem, 'key'>) {
  return (
    <span className={`plant-legend__chip${icon ? ' plant-legend__chip--icon' : ''}`}>
      {swatchClassName ? <span className={swatchClassName} aria-hidden="true" /> : null}
      {icon ? (
        <span className="plant-legend__chip-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {label}
    </span>
  )
}

function LegendRow({ label, items, withDivider }: LegendRowProps) {
  return (
    <div
      className={`plant-legend__row${withDivider ? ' plant-legend__row--divider' : ''}`}
    >
      <span className="plant-legend__group-label">{label}</span>
      {items.map((item) => (
        <LegendChip
          key={item.key}
          swatchClassName={item.swatchClassName}
          icon={item.icon}
          label={item.label}
        />
      ))}
    </div>
  )
}

export function PlantLegend() {
  const { t, lang } = useLanguage()
  const d = t.plantMap
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()

  const stateItems: LegendChipItem[] = [
    {
      key: 'occupied',
      swatchClassName: 'plant-legend__chip-swatch plant-legend__chip-swatch--occupied',
      label: d.legendOccupied,
    },
    {
      key: 'waiting',
      swatchClassName: 'plant-legend__chip-swatch plant-legend__chip-swatch--waiting',
      label: d.legendColorWaiting,
    },
    {
      key: 'blocked',
      swatchClassName: 'plant-legend__chip-swatch plant-legend__chip-swatch--blocked',
      label: d.legendColorBlocked,
    },
    {
      key: 'free',
      swatchClassName: 'plant-legend__chip-swatch plant-legend__chip-swatch--free',
      label: d.legendFree,
    },
  ]

  const companyItems: LegendChipItem[] = [
    {
      key: 'sumo',
      swatchClassName: 'plant-legend__chip-swatch plant-legend__chip-swatch--sumo',
      label: d.legendSumoStripe,
    },
    {
      key: 'maf',
      swatchClassName: 'plant-legend__chip-swatch plant-legend__chip-swatch--maf',
      label: d.legendMafStripe,
    },
  ]

  const typeItems: LegendChipItem[] = [
    {
      key: 'robot',
      icon: <RobotArmIcon size={ICON_SIZE} aria-hidden="true" />,
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

  const topIconItems: LegendChipItem[] = [
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

  const bottomIconItems: LegendChipItem[] = [
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
      key: 'block',
      icon: <Lock size={ICON_SIZE} aria-hidden="true" />,
      label: PLANT_LEGEND_ICON_BLOCK[lang],
    },
  ]

  return (
    <section
      className={`plant-legend plant-legend--collapsible dash-card${expanded ? ' plant-legend--expanded' : ' plant-legend--collapsed'}`}
      aria-label={d.legendTitle}
    >
      <div className="plant-legend__header">
        <div className="plant-legend__header-text">
          <h2 className="plant-legend__title">{d.legendTitle}</h2>
          <p className="plant-legend__summary">{PLANT_LEGEND_COLLAPSED_SUMMARY[lang]}</p>
        </div>
        <button
          type="button"
          className="plant-legend__toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={expanded ? PLANT_LEGEND_CLOSE_ARIA[lang] : PLANT_LEGEND_OPEN_ARIA[lang]}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? (
            <ChevronUp size={20} strokeWidth={2} aria-hidden="true" />
          ) : (
            <ChevronDown size={20} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      <div id={panelId} className="plant-legend__panel" hidden={!expanded}>
        <div className="plant-legend__body">
          <LegendRow label={PLANT_LEGEND_SECTION_STATES[lang]} items={stateItems} />
          <LegendRow label={PLANT_LEGEND_SECTION_COMPANY[lang]} items={companyItems} />
          <LegendRow label={d.legendTypesLabel} items={typeItems} />
          <LegendRow label={d.legendIconsTopLabel} items={topIconItems} withDivider />
          <LegendRow label={d.legendIconsBottomLabel} items={bottomIconItems} withDivider />
        </div>
      </div>
    </section>
  )
}
