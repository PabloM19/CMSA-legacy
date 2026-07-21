import { useMemo, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'
import { findProductById } from '../../../data/mockProducts'
import { getAlarmsForCell } from '../../../data/mockCellAlarms'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView } from '../../../types/plant'
import { getState } from '../../../utils/backlogStorage'
import { getDrawerSpeedMessage, getDrawerStateNotice } from '../../../utils/plantMapCopyHelpers'
import { getStatusLabel, getTypeLabel } from '../../../utils/plantMapHelpers'
import {
  getReferenceHeights,
  getReferencePalletType,
} from '../../../utils/referenceDisplayHelpers'

interface PlantElementDrawerProps {
  element: PlantElementView | null
  onClose: () => void
  variant?: 'side' | 'bottom'
  footer?: ReactNode
  cellCode?: string | null
}

function resolveOrderProgressPercent(
  boxes: number | null | undefined,
  boxesProduced: number | null | undefined,
  occupancyPercent: number | null | undefined,
): number | null {
  if (boxes != null && boxes > 0 && boxesProduced != null) {
    return Math.min(100, Math.round((boxesProduced / boxes) * 100))
  }
  if (occupancyPercent != null) {
    return Math.min(100, Math.round(occupancyPercent))
  }
  return null
}

function resolveBoxesProduced(
  boxes: number,
  boxesProduced: number | null | undefined,
  occupancyPercent: number | null | undefined,
): number {
  if (boxesProduced != null) return boxesProduced
  if (boxes > 0 && occupancyPercent != null) {
    return Math.round((boxes * occupancyPercent) / 100)
  }
  return 0
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

  const orderContext = useMemo(() => {
    if (!element?.orderId) return null
    const state = getState()
    const order = state.orders.find((item) => item.id === element.orderId) ?? null
    const dailyOrder = order?.pedidoDiaId
      ? state.dailyOrders.find((item) => item.id === order.pedidoDiaId) ?? null
      : null
    const catalogProduct = order?.productId ? findProductById(order.productId) : undefined
    const progressPercent = order
      ? resolveOrderProgressPercent(order.boxes, order.boxesProduced, order.occupancyPercent)
      : resolveOrderProgressPercent(element.boxes, null, element.occupancyPercent)

    return {
      order,
      dailyOrder,
      palletType: catalogProduct ? getReferencePalletType(catalogProduct) : null,
      heights: catalogProduct ? getReferenceHeights(catalogProduct) : null,
      barcode: order?.barcode ?? dailyOrder?.barcode ?? null,
      progressPercent,
    }
  }, [element])

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

  const etaDisplay = element.eta ?? orderContext?.order?.etc ?? orderContext?.order?.endTime ?? null
  const occupancyDisplay = isFree
    ? d.available
    : element.occupancyPercent != null
      ? `${element.occupancyPercent}% ${d.occupancyLabel}`
      : d.zeroOccupancy

  const hasOrderDetails = Boolean(
    !isFree &&
      (element.orderId ||
        element.orderReference ||
        element.product ||
        element.variety ||
        orderContext?.dailyOrder),
  )

  return createPortal(
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
          {etaDisplay && (
            <div>
              <dt>{d.drawerEtc}</dt>
              <dd>{etaDisplay}</dd>
            </div>
          )}
          {!isFree && (
            <div>
              <dt>{d.drawerOccupancy}</dt>
              <dd>{occupancyDisplay}</dd>
            </div>
          )}
          {orderContext?.progressPercent != null && (
            <div>
              <dt>{d.drawerProgress}</dt>
              <dd>
                <div className="plant-drawer__progress">
                  <div className="plant-drawer__progress-bar">
                    <span
                      className="plant-drawer__progress-fill"
                      style={{ width: `${orderContext.progressPercent}%` }}
                    />
                  </div>
                  <span className="plant-drawer__progress-label">{orderContext.progressPercent}%</span>
                </div>
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

        {stateNotice && (
          <div className={`plant-drawer__notice plant-drawer__notice--${stateNotice.tone}`}>
            <p>{stateNotice.title}</p>
            {stateNotice.detail && <p>{stateNotice.detail}</p>}
          </div>
        )}

        {hasOrderDetails && (
          <section className="plant-drawer__section">
            <h3 className="plant-drawer__section-title">{d.drawerOrder}</h3>
            <dl className="plant-drawer__dl">
              {element.orderId && (
                <div>
                  <dt>{d.drawerProductionOrder}</dt>
                  <dd>{element.orderId}</dd>
                </div>
              )}
              {orderContext?.dailyOrder && (
                <div>
                  <dt>{d.drawerDailyOrder}</dt>
                  <dd>{orderContext.dailyOrder.id}</dd>
                </div>
              )}
              {element.orderReference && (
                <div>
                  <dt>{d.drawerReference}</dt>
                  <dd>{element.orderReference}</dd>
                </div>
              )}
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
                  <dd>{element.boxes.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')}</dd>
                </div>
              )}
              {orderContext?.order && (
                <div>
                  <dt>{d.drawerBoxesProduced}</dt>
                  <dd>
                    {resolveBoxesProduced(
                      orderContext.order.boxes,
                      orderContext.order.boxesProduced,
                      orderContext.order.occupancyPercent,
                    ).toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')}
                    {' / '}
                    {orderContext.order.boxes.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')}
                  </dd>
                </div>
              )}
              {element.boxesPerHour != null && (
                <div>
                  <dt>{d.drawerBoxesPerHour}</dt>
                  <dd>{element.boxesPerHour}</dd>
                </div>
              )}
              {orderContext?.palletType && (
                <div>
                  <dt>{d.drawerPalletType}</dt>
                  <dd>{orderContext.palletType}</dd>
                </div>
              )}
              {orderContext?.heights && (
                <div>
                  <dt>{d.drawerHeights}</dt>
                  <dd>{orderContext.heights}</dd>
                </div>
              )}
              {orderContext?.barcode && (
                <div>
                  <dt>{d.drawerBarcode}</dt>
                  <dd>{orderContext.barcode}</dd>
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
            <h3 className="plant-drawer__section-title">{d.drawerActiveEvent}</h3>
            <dl className="plant-drawer__dl">
              <div>
                <dt>{d.eventTypeLabel}</dt>
                <dd>{activeAlarm.type}</dd>
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
    </div>,
    document.body,
  )
}
