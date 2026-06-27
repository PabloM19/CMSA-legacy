import type { ReactNode } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView } from '../../../types/plant'
import { getSpeedLabel, getStatusLabel, getTypeLabel } from '../../../utils/plantMapHelpers'

interface PlantElementDrawerProps {
  element: PlantElementView | null
  onClose: () => void
  variant?: 'side' | 'bottom'
  footer?: ReactNode
}

export function PlantElementDrawer({
  element,
  onClose,
  variant = 'side',
  footer,
}: PlantElementDrawerProps) {
  const { t, lang } = useLanguage()
  const d = t.plantMap

  if (!element) return null

  const isFree = element.status === 'free' || element.status === 'idle'
  const isBlocked = element.status === 'blocked' || element.status === 'conflict'
  const isPalletizer = element.type === 'palletizer'

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

        {isBlocked && (
          <div className="plant-drawer__notice plant-drawer__notice--warn">
            <p>{d.drawerBlockedTitle}</p>
            <p>{d.drawerBlockedSubtitle}</p>
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
              {element.eta && (
                <div>
                  <dt>{d.drawerEta}</dt>
                  <dd>{element.eta}</dd>
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

        {element.alert && (
          <section className="plant-drawer__section">
            <h3 className="plant-drawer__section-title">{d.drawerAlerts}</h3>
            <p className="plant-drawer__alert">⚠️ {element.alert}</p>
          </section>
        )}

        {element.speedStatus && (
          <section className="plant-drawer__section">
            <h3 className="plant-drawer__section-title">{d.drawerSpeed}</h3>
            <p>{getSpeedLabel(element.speedStatus, lang)}</p>
          </section>
        )}

        {footer && <footer className="plant-drawer__footer">{footer}</footer>}
      </aside>
    </div>
  )
}
