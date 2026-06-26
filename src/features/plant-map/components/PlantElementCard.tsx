import { Pause } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView } from '../../../types/plant'
import { getSpeedEmoji, getSpeedLabel, getStatusLabel, statusCssClass } from '../../../utils/plantMapHelpers'

export interface PlantElementCardProps {
  id: string
  name: string
  type: PlantElementView['type']
  status: PlantElementView['status']
  company: PlantElementView['company']
  orderId: PlantElementView['orderId']
  orderReference: PlantElementView['orderReference']
  speedStatus: PlantElementView['speedStatus']
  alert: PlantElementView['alert']
  isClickable: boolean
  selected?: boolean
  onClick?: () => void
}

export function PlantElementCard({
  name,
  type,
  status,
  company,
  orderReference,
  speedStatus,
  alert,
  isClickable,
  selected,
  onClick,
}: PlantElementCardProps) {
  const { t, lang } = useLanguage()
  const d = t.plantMap

  const statusClass = statusCssClass(status)
  const companyClass = company ? `plant-element--${company.toLowerCase()}` : 'plant-element--neutral'
  const isWarning = status === 'blocked' || status === 'conflict' || Boolean(alert)
  const isWaiting = status === 'waiting'
  const speedLabel = getSpeedLabel(speedStatus, lang)
  const speedEmoji = getSpeedEmoji(speedStatus)

  const Tag = isClickable ? 'button' : 'div'

  return (
    <Tag
      type={isClickable ? 'button' : undefined}
      className={`plant-element plant-element--${type} plant-element--${statusClass} ${companyClass}${selected ? ' plant-element--selected' : ''}${!isClickable ? ' plant-element--static' : ''}`}
      onClick={isClickable ? onClick : undefined}
      aria-label={`${name} — ${getStatusLabel(status, lang)}`}
    >
      <span className="plant-element__name">{name}</span>
      <span className="plant-element__status">{getStatusLabel(status, lang)}</span>

      {orderReference && (
        <span className="plant-element__order">{orderReference}</span>
      )}

      <div className="plant-element__foot">
        {speedLabel && (
          <span className="plant-element__speed" title={speedLabel}>
            {speedEmoji ?? speedLabel}
          </span>
        )}
        {isWaiting && (
          <span className="plant-element__icon plant-element__icon--wait" title={d.legendWaiting}>
            <Pause size={12} aria-hidden="true" />
          </span>
        )}
        {isWarning && (
          <span className="plant-element__icon plant-element__icon--warn" title={alert ?? d.legendConflict}>
            ⚠️
          </span>
        )}
      </div>

      {type === 'palletizer' && (
        <span className="plant-element__tag">{d.palletizerTag}</span>
      )}
    </Tag>
  )
}
