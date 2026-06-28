import type { ReactNode } from 'react'
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  OctagonAlert,
  Pause,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView } from '../../../types/plant'
import {
  getCardStatusSoftLabel,
  getSpeedTooltip,
} from '../../../utils/plantMapCopyHelpers'
import { getSpeedEmoji, getStatusLabel, statusCssClass } from '../../../utils/plantMapHelpers'

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

const STATUS_ICON_SIZE = 24

function IconBadge({
  className,
  title,
  ariaLabel,
  children,
}: {
  className: string
  title: string
  ariaLabel: string
  children: ReactNode
}) {
  return (
    <span
      className={className}
      title={title}
      role="img"
      aria-label={ariaLabel}
    >
      {children}
    </span>
  )
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
  const isConflict = status === 'conflict' || Boolean(alert)
  const isBlocked = status === 'blocked'
  const isWaiting = status === 'waiting'
  const isValidated = status === 'validated'
  const isPending = status === 'pending_validation' || status === 'reserved'
  const softStatus = getCardStatusSoftLabel(status, d)
  const cardStatus = softStatus || getStatusLabel(status, lang)
  const speedTooltip = getSpeedTooltip(speedStatus, d)
  const speedEmoji = getSpeedEmoji(speedStatus)

  const Tag = isClickable ? 'button' : 'div'

  return (
    <Tag
      type={isClickable ? 'button' : undefined}
      className={`plant-element plant-element--${type} plant-element--${statusClass} ${companyClass}${selected ? ' plant-element--selected' : ''}${!isClickable ? ' plant-element--static' : ''}`}
      onClick={isClickable ? onClick : undefined}
      aria-label={`${name} — ${cardStatus}`}
    >
      <span className="plant-element__name">{name}</span>
      <span className="plant-element__status">{cardStatus}</span>

      {orderReference && (
        <span className="plant-element__order">{orderReference}</span>
      )}

      <div className="plant-element__foot">
        {isValidated && (
          <IconBadge
            className="plant-status-icon plant-status-icon--ok"
            title={d.iconValidatedLong}
            ariaLabel={d.iconValidatedLong}
          >
            <Check size={STATUS_ICON_SIZE} aria-hidden="true" />
          </IconBadge>
        )}
        {isPending && (
          <IconBadge
            className="plant-status-icon plant-status-icon--pending"
            title={d.legendPending}
            ariaLabel={d.legendPending}
          >
            <ClipboardCheck size={STATUS_ICON_SIZE} aria-hidden="true" />
          </IconBadge>
        )}
        {isBlocked && (
          <IconBadge
            className="plant-status-icon plant-status-icon--blocked"
            title={d.iconBlockedLong}
            ariaLabel={d.iconBlockedLong}
          >
            <OctagonAlert size={STATUS_ICON_SIZE} aria-hidden="true" />
          </IconBadge>
        )}
        {speedTooltip && (
          <IconBadge
            className={`plant-status-icon plant-status-icon--speed plant-status-icon--${speedStatus ?? 'normal'}`}
            title={speedTooltip}
            ariaLabel={speedTooltip}
          >
            {speedEmoji ? (
              <span className="plant-status-icon__emoji" aria-hidden="true">
                {speedEmoji}
              </span>
            ) : (
              <Check size={STATUS_ICON_SIZE} aria-hidden="true" />
            )}
          </IconBadge>
        )}
        {isWaiting && (
          <IconBadge
            className="plant-status-icon plant-status-icon--wait"
            title={d.iconWaitLong}
            ariaLabel={d.iconWaitLong}
          >
            <Pause size={STATUS_ICON_SIZE} aria-hidden="true" />
          </IconBadge>
        )}
        {isConflict && (
          <IconBadge
            className="plant-status-icon plant-status-icon--warn"
            title={alert ?? d.iconWarningLong}
            ariaLabel={alert ?? d.iconWarningLong}
          >
            <AlertTriangle size={STATUS_ICON_SIZE} aria-hidden="true" />
          </IconBadge>
        )}
      </div>

      {type === 'palletizer' && (
        <span className="plant-element__tag">{d.palletizerTag}</span>
      )}
    </Tag>
  )
}
