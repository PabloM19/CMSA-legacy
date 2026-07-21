import type { ReactNode } from 'react'
import {
  AlertTriangle,
  Ban,
  Lock,
  PauseCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView, PlantSpeedStatus } from '../../../types/plant'
import { getSpeedTooltip } from '../../../utils/plantMapCopyHelpers'
import { getStatusLabel, hasCriticalBlink, statusCssClass } from '../../../utils/plantMapHelpers'
import { PlantTypeAnimatedIcon } from './PlantTypeAnimatedIcon'

export interface PlantElementCardProps {
  id: string
  name: string
  type: PlantElementView['type']
  status: PlantElementView['status']
  company: PlantElementView['company']
  orderId: PlantElementView['orderId']
  orderReference: PlantElementView['orderReference']
  speedStatus: PlantElementView['speedStatus']
  occupancyPercent: PlantElementView['occupancyPercent']
  eta: PlantElementView['eta']
  alert: PlantElementView['alert']
  isClickable: boolean
  isDisabled?: boolean
  isCritical?: boolean
  selected?: boolean
  onClick?: () => void
  extraClassName?: string
}

const ICON_SIZE = 14

function SpeedIcon({ speed }: { speed: PlantSpeedStatus }) {
  if (speed === 'slow') return <TrendingDown size={ICON_SIZE} aria-hidden="true" />
  if (speed === 'fast') return <TrendingUp size={ICON_SIZE} aria-hidden="true" />
  return null
}

function StatusIcon({
  className,
  title,
  children,
}: {
  className: string
  title: string
  children: ReactNode
}) {
  return (
    <span className={className} title={title} role="img" aria-label={title}>
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
  isDisabled = false,
  isCritical = false,
  selected,
  onClick,
  extraClassName,
}: PlantElementCardProps) {
  const { t, lang } = useLanguage()
  const d = t.plantMap

  const statusClass = statusCssClass(status, isDisabled)
  const companyClass = isDisabled
    ? 'plant-element--neutral'
    : company
      ? `plant-element--${company.toLowerCase()}`
      : 'plant-element--neutral'
  const isFree = !isDisabled && (status === 'free' || status === 'idle')
  const isOccupied = !isDisabled && !isFree
  const isConflict = status === 'conflict'
  const isBlocked = status === 'blocked'
  const isWaiting = status === 'waiting'
  const hasActiveAlert = Boolean(alert) && !isConflict && !isBlocked
  const criticalBlink = hasCriticalBlink(status)
  const statusLabel = isDisabled ? d.legendDisabled : getStatusLabel(status, lang)
  const speedTooltip = getSpeedTooltip(speedStatus, d)
  const showSpeed = isOccupied && (speedStatus === 'slow' || speedStatus === 'fast')

  const hasFooterIcons =
    !isDisabled && (isBlocked || isWaiting || isConflict || hasActiveAlert)

  const Tag = isClickable ? 'button' : 'div'

  return (
    <Tag
      type={isClickable ? 'button' : undefined}
      className={`plant-element plant-element--compact plant-element--${type} plant-element--${statusClass} ${companyClass}${selected ? ' plant-element--selected' : ''}${!isClickable ? ' plant-element--static' : ''}${criticalBlink ? ' plant-element--critical-blink' : ''}${hasActiveAlert ? ' plant-element--has-alert' : ''}${isFree ? ' plant-element--free-slot' : ''}${isDisabled ? ' plant-element--disabled' : ''}${isCritical ? ' plant-element--situation-critical' : ''}${extraClassName ?? ''}`}
      onClick={isClickable ? onClick : undefined}
      data-no-board-drag=""
      aria-label={`${name} — ${statusLabel}${orderReference ? ` — ${orderReference}` : ''}`}
    >
      <div className="plant-element__head">
        <div className="plant-element__head-left">
          <span
            className={`plant-element__type-icon plant-element__type-icon--${type}`}
            title={
              type === 'automatic'
                ? d.legendTypeRobot
                : type === 'palletizer'
                  ? d.legendTypePalletizer
                  : d.legendTypeManual
            }
            aria-hidden="true"
          >
            <PlantTypeAnimatedIcon type={type} />
          </span>
          <span className="plant-element__name">{name}</span>
        </div>
        {showSpeed && (
          <div className="plant-element__head-right">
            <StatusIcon
              className={`plant-status-icon plant-status-icon--speed plant-status-icon--head plant-status-icon--speed--${speedStatus}`}
              title={speedTooltip ?? ''}
            >
              <SpeedIcon speed={speedStatus} />
            </StatusIcon>
          </div>
        )}
      </div>

      <div className="plant-element__compact-spacer" aria-hidden="true" />

      {isDisabled && (
        <span className="plant-element__disabled-label">{d.legendDisabled}</span>
      )}

      {isFree && (
        <span className="plant-element__free-label">{d.legendFree}</span>
      )}

      {hasFooterIcons && (
        <div className="plant-element__foot">
          {hasActiveAlert && (
            <StatusIcon
              className="plant-status-icon plant-status-icon--warn plant-status-icon--foot"
              title={alert ?? d.legendIconEvent}
            >
              <AlertTriangle size={ICON_SIZE} aria-hidden="true" />
            </StatusIcon>
          )}
          {isWaiting && (
            <StatusIcon
              className="plant-status-icon plant-status-icon--wait plant-status-icon--foot"
              title={d.iconWaitLong}
            >
              <PauseCircle size={ICON_SIZE} aria-hidden="true" />
            </StatusIcon>
          )}
          {isBlocked && (
            <StatusIcon
              className="plant-status-icon plant-status-icon--blocked plant-status-icon--foot"
              title={d.iconBlockedLong}
            >
              <Lock size={ICON_SIZE} aria-hidden="true" />
            </StatusIcon>
          )}
          {isConflict && (
            <StatusIcon
              className="plant-status-icon plant-status-icon--warn plant-status-icon--foot"
              title={d.drawerBlockedElementTitle}
            >
              <Ban size={ICON_SIZE} aria-hidden="true" />
            </StatusIcon>
          )}
        </div>
      )}
    </Tag>
  )
}
