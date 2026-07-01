import type { ReactNode } from 'react'
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Lock,
  PauseCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView, PlantSpeedStatus } from '../../../types/plant'
import { getSpeedTooltip } from '../../../utils/plantMapCopyHelpers'
import { getStatusLabel, hasCriticalBlink, statusCssClass } from '../../../utils/plantMapHelpers'

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
  selected?: boolean
  onClick?: () => void
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
  speedStatus,
  occupancyPercent,
  eta,
  alert,
  isClickable,
  selected,
  onClick,
}: PlantElementCardProps) {
  const { t, lang } = useLanguage()
  const d = t.plantMap

  const statusClass = statusCssClass(status)
  const companyClass = company ? `plant-element--${company.toLowerCase()}` : 'plant-element--neutral'
  const isFree = status === 'free' || status === 'idle'
  const isConflict = status === 'conflict'
  const isBlocked = status === 'blocked'
  const isWaiting = status === 'waiting'
  const isValidated = status === 'validated'
  const isPreparing =
    status === 'preparing' || status === 'pending_validation' || status === 'reserved'
  const hasActiveAlert = Boolean(alert) && !isConflict && !isBlocked
  const criticalBlink = hasCriticalBlink(status)
  const statusLabel = getStatusLabel(status, lang)
  const speedTooltip = getSpeedTooltip(speedStatus, d)
  const showSpeed = Boolean(speedTooltip && speedStatus && speedStatus !== 'normal')
  const showOccupancy = !isFree

  const hasFooterIcons =
    isPreparing || isBlocked || isWaiting || isConflict || hasActiveAlert || isValidated

  const Tag = isClickable ? 'button' : 'div'

  return (
    <Tag
      type={isClickable ? 'button' : undefined}
      className={`plant-element plant-element--${type} plant-element--${statusClass} ${companyClass}${selected ? ' plant-element--selected' : ''}${!isClickable ? ' plant-element--static' : ''}${criticalBlink ? ' plant-element--critical-blink' : ''}${hasActiveAlert ? ' plant-element--has-alert' : ''}${isFree ? ' plant-element--free-slot' : ''}`}
      onClick={isClickable ? onClick : undefined}
      aria-label={`${name} — ${statusLabel}`}
    >
      <div className="plant-element__head">
        <span className="plant-element__name">{name}</span>
        {showSpeed && (
          <div className="plant-element__head-right">
            <StatusIcon
              className={`plant-status-icon plant-status-icon--speed plant-status-icon--head plant-status-icon--${speedStatus}`}
              title={speedTooltip ?? ''}
            >
              <SpeedIcon speed={speedStatus} />
            </StatusIcon>
          </div>
        )}
      </div>

      {isFree && <span className="plant-element__free-label">{d.legendFree}</span>}

      {(eta || showOccupancy) && (
        <div className="plant-element__metrics">
          {eta && (
            <div className="plant-element__eta">
              <span className="plant-element__eta-label">{d.drawerEta}</span>
              <span className="plant-element__eta-value">{eta}</span>
            </div>
          )}
          {showOccupancy && (
            <div className="plant-element__occupancy">
              <span className="plant-element__occupancy-value">{occupancyPercent ?? 0}%</span>
              <span className="plant-element__occupancy-label">{d.occupancyLabel}</span>
            </div>
          )}
        </div>
      )}

      {hasFooterIcons && (
        <div className="plant-element__foot">
          {hasActiveAlert && (
            <StatusIcon
              className="plant-status-icon plant-status-icon--warn plant-status-icon--foot"
              title={alert ?? d.legendIconAlarm}
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
          {isPreparing && (
            <StatusIcon
              className="plant-status-icon plant-status-icon--preparing plant-status-icon--foot"
              title={d.legendPreparing}
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
          {isValidated && (
            <StatusIcon
              className="plant-status-icon plant-status-icon--ok plant-status-icon--foot"
              title={d.iconValidatedLong}
            >
              <CheckCircle2 size={ICON_SIZE} aria-hidden="true" />
            </StatusIcon>
          )}
        </div>
      )}

      {type === 'palletizer' && (
        <span className="plant-element__tag">{d.palletizerTag}</span>
      )}
    </Tag>
  )
}
