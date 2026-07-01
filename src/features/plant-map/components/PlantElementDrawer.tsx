import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { getAlarmsForCell } from '../../../data/mockCellAlarms'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView } from '../../../types/plant'
import { getDrawerSpeedMessage, getDrawerStateNotice } from '../../../utils/plantMapCopyHelpers'
import { getStatusLabel, getTypeLabel } from '../../../utils/plantMapHelpers'

interface PlantElementDrawerProps {
  element: PlantElementView | null
  onClose: () => void
  variant?: 'side' | 'bottom'
  footer?: ReactNode
  cellCode?: string | null
}

export function PlantElementDrawer({
  element,
  onClose,
  variant = 'side',
  footer,
  cellCode,
}: PlantElementDrawerProps) {
  const { t, lang } = useLanguage()
  const d = t.plantMap

  if (!element) return null

  const isFree = element.status === 'free' || element.status === 'idle'
  const isPalletizer = element.type === 'palletizer'
  const isConflict = element.status === 'conflict'
  const stateNotice = isConflict
    ? { title: d.drawerBlockedElementTitle, detail: d.drawerBlockedElementDetail, tone: 'warn' as const }
    : getDrawerStateNotice(element, d)
  const speedMessage = element.speedStatus
    ? getDrawerSpeedMessage(element.speedStatus, d)
    : null
  const cellAlarms = getAlarmsForCell(cellCode ?? element.name)
  const activeAlarm = cellAlarms.find((alarm) => alarm.status === 'active') ?? cellAlarms[0]

  const etaDisplay = element.eta ?? d.noEta
  const occupancyDisplay = isFree
    ? d.available
    : element.occupancyPercent != null
      ? `${element.occupancyPercent}% ${d.occupancyLabel}`
      : d.zeroOccupancy

  return (
    <div className="plant-drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className={`plant-drawer${variant === 'bottom' ? ' plant-drawer--bottom' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plant-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="plant-drawer__head">
          <div>
            <h2 id="plant-drawer-title" className="plant-drawer__title">
              {element.name}
            </h2>
            <p className="plant-drawer__subtitle">{getTypeLabel(element.type, lang)}</p>
          </div>
          <button type="button" className="plant-drawer__close" onClick={onClose} aria-label={d.close}>
            ×
          </button>
        </header>

        <dl className="plant-drawer__dl">
          <div>
            <dt>{d.drawerStatus}</dt>
            <dd>{getStatusLabel(element.status, lang)}</dd>
          </div>
          {element.company && (
            <div>
              <dt>{d.drawerCompany}</dt>
              <dd>
                <span className={`dash-chip dash-chip--${element.company.toLowerCase()}`}>
                  {element.company}
                </span>
              </dd>
            </div>
          )}
          <div>
            <dt>{d.drawerEta}</dt>
            <dd>{etaDisplay}</dd>
          </div>
          <div>
            <dt>{d.drawerOccupancy}</dt>
            <dd>{occupancyDisplay}</dd>
          </div>
        </dl>

        {isPalletizer && (
          <p className="plant-drawer__note">{d.palletizerSecondary}</p>
        )}

        {isFree && !isPalletizer && (
          <div className="plant-drawer__notice plant-drawer__notice--ok">
            <p>{d.drawerFreeTitle}</p>
            <p>{d.drawerFreeSubtitle}</p>
          </div>
        )}

        {stateNotice && (
          <div className={`plant-drawer__notice plant-drawer__notice--${stateNotice.tone}`}>
            <p>{stateNotice.title}</p>
            {stateNotice.detail && <p>{stateNotice.detail}</p>}
          </div>
        )}

        {element.orderReference && (
          <section className="plant-drawer__section">
            <h3 className="plant-drawer__section-title">{d.drawerOrder}</h3>
            <dl className="plant-drawer__dl">
              <div>
                <dt>{d.drawerReference}</dt>
                <dd>{element.orderReference}</dd>
              </div>
              {element.product && (
                <div>
                  <dt>{d.drawerProduct}</dt>
                  <dd>{element.product}</dd>
                </div>
              )}
              {element.variety && (
                <div>
                  <dt>{d.drawerVariety}</dt>
                  <dd>{element.variety}</dd>
                </div>
              )}
              {element.boxes != null && (
                <div>
                  <dt>{d.drawerBoxes}</dt>
                  <dd>{element.boxes}</dd>
                </div>
              )}
              {element.boxesPerHour != null && (
                <div>
                  <dt>{d.drawerBoxesPerHour}</dt>
                  <dd>{element.boxesPerHour}</dd>
                </div>
              )}
              {element.remainingTime && (
                <div>
                  <dt>{d.drawerRemaining}</dt>
                  <dd>{element.remainingTime}</dd>
                </div>
              )}
              {element.endTime && (
                <div>
                  <dt>{d.drawerEndTime}</dt>
                  <dd>{element.endTime}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {activeAlarm && (
          <section className="plant-drawer__section">
            <h3 className="plant-drawer__section-title">{d.drawerActiveAlarm}</h3>
            <dl className="plant-drawer__dl">
              <div>
                <dt>{d.alarmTypeLabel}</dt>
                <dd>{activeAlarm.type}</dd>
              </div>
              <div>
                <dt>{d.alarmSeverityLabel}</dt>
                <dd>
                  {activeAlarm.severity === 'critical' ? d.alarmSeverityHigh : d.alarmSeverityMedium}
                </dd>
              </div>
            </dl>
            <p className="plant-drawer__alert">
              <AlertTriangle size={16} aria-hidden="true" />
              {activeAlarm.message}
            </p>
          </section>
        )}

        {element.alert && !activeAlarm && !stateNotice?.detail && (
          <section className="plant-drawer__section">
            <h3 className="plant-drawer__section-title">{d.drawerAlerts}</h3>
            <p className="plant-drawer__alert">
              <AlertTriangle size={16} aria-hidden="true" />
              {element.alert}
            </p>
          </section>
        )}

        {speedMessage && (
          <section className="plant-drawer__section">
            <h3 className="plant-drawer__section-title">{d.drawerSpeedTitle}</h3>
            <p>{speedMessage}</p>
          </section>
        )}

        {footer && <footer className="plant-drawer__footer">{footer}</footer>}
      </aside>
    </div>
  )
}
