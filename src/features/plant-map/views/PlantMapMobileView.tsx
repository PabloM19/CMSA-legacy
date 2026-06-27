import { useEffect, useMemo, useState } from 'react'
import { Bell, Factory } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { useLanguage } from '../../../i18n/LanguageContext'
import { getState } from '../../../utils/backlogStorage'
import {
  computeMobileCompanyStats,
  computeMobileOccupancyVisual,
  computeMobileTableSummary,
  getMobileActiveProduction,
  getMobileAlerts,
  getMobileDateTime,
  getMobileFinishingSoon,
  getMobileGeneralStatus,
  getMobileStatusMessage,
} from '../../../utils/mobileHelpers'
import '../../mobile/mobile.css'

function LoadBar({
  label,
  occupied,
  total,
  accentClass,
}: {
  label: string
  occupied: number
  total: number
  accentClass: string
}) {
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0
  return (
    <div className={`mobile-load-bar ${accentClass}`}>
      <div className="mobile-load-bar__head">
        <span>{label}</span>
        <strong>
          {occupied}/{total}
        </strong>
      </div>
      <div className="mobile-load-bar__track">
        <div className="mobile-load-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Vista consulta móvil — monitorización rápida, sin acciones operativas */
export function PlantMapMobileView() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.mobile

  const [state, setState] = useState(() => getState())
  const [dateTime, setDateTime] = useState(() => getMobileDateTime(lang))

  useEffect(() => {
    setState(getState())
    setDateTime(getMobileDateTime(lang))
    const timer = window.setInterval(() => setDateTime(getMobileDateTime(lang)), 60000)
    return () => window.clearInterval(timer)
  }, [lang])

  const generalStatus = useMemo(() => getMobileGeneralStatus(state), [state])
  const statusMessage = useMemo(
    () => getMobileStatusMessage(generalStatus, lang),
    [generalStatus, lang],
  )
  const companyStats = useMemo(() => computeMobileCompanyStats(state), [state])
  const activeProduction = useMemo(() => getMobileActiveProduction(state, lang), [state, lang])
  const finishingSoon = useMemo(() => getMobileFinishingSoon(state.orders, lang), [state.orders, lang])
  const alerts = useMemo(() => getMobileAlerts(state, lang), [state, lang])
  const tableSummary = useMemo(() => computeMobileTableSummary(state), [state])
  const occupancy = useMemo(() => computeMobileOccupancyVisual(state), [state])

  const statusLabel =
    generalStatus === 'critical'
      ? d.statusCritical
      : generalStatus === 'warning'
        ? d.statusWarning
        : d.statusOk

  if (!user) return null

  return (
    <div className="mobile-page mobile-page--fluid">
      <PageHeader
        title={d.title}
        description={d.subtitle}
        showMockBadge
        extra={
          <header className="mobile-header">
            <div className="mobile-header__row">
              <time className="mobile-header__datetime">{dateTime}</time>
              <span className={`mobile-header__status mobile-header__status--${generalStatus}`}>
                {statusLabel}
              </span>
            </div>
            <div className="mobile-header__user">
              <span>{user.name}</span>
              <span className="mobile-header__dot">·</span>
              <span>{user.company}</span>
              <span className="mobile-header__dot">·</span>
              <span>{t.roles[user.role]}</span>
            </div>
          </header>
        }
      />

      <section className={`mobile-hero dash-card mobile-hero--${generalStatus}`}>
        <p className="mobile-hero__status">{d.generalStatus}</p>
        <p className="mobile-hero__label">{statusLabel}</p>
        <p className="mobile-hero__message">{statusMessage}</p>
      </section>

      <section className="mobile-section dash-card">
        <h2 className="mobile-section__title">{d.capacityTitle}</h2>
        <div className="mobile-company-grid">
          {companyStats.map((item) => (
            <article
              key={item.company}
              className={`mobile-company-card mobile-company-card--${item.company.toLowerCase()}`}
            >
              <p className="mobile-company-card__name">{item.company}</p>
              <div className="mobile-company-card__capacity">
                <span className="mobile-company-card__capacity-value">{item.availablePercent}%</span>
                <span className="mobile-company-card__capacity-label">{d.capacityAvailable}</span>
              </div>
              <div className="mobile-company-card__load">
                <div
                  className="mobile-company-card__load-fill"
                  style={{ width: `${item.loadPercent}%` }}
                />
              </div>
              <div className="mobile-company-card__row">
                <span>{d.occupiedTables}</span>
                <strong>{item.occupiedTables}</strong>
              </div>
              <div className="mobile-company-card__row">
                <span>{d.activeOrders}</span>
                <strong>{item.activeOrders}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mobile-section dash-card">
        <h2 className="mobile-section__title">{d.activeProductionTitle}</h2>
        {activeProduction.length === 0 ? (
          <EmptyState
            icon={<Factory size={26} strokeWidth={1.5} />}
            title={d.noActiveProduction}
            description={d.readOnlyHint}
          />
        ) : (
          <ul className="mobile-list">
            {activeProduction.map((order) => (
              <li
                key={order.id}
                className={`mobile-list-item mobile-list-item--${order.company.toLowerCase()}`}
              >
                <div className="mobile-list-item__head">
                  <strong>{order.reference}</strong>
                  <span className={`dash-chip dash-chip--${order.company.toLowerCase()}`}>
                    {order.company}
                  </span>
                </div>
                <p className="mobile-list-item__product">
                  {order.company} · {order.product}
                </p>
                <p className="mobile-list-item__meta">
                  {d.tables}: {order.tables || '—'}
                </p>
                {order.remainingLabel && (
                  <p className="mobile-list-item__meta mobile-list-item__meta--strong">
                    {order.remainingLabel}
                  </p>
                )}
                {order.endTime && (
                  <p className="mobile-list-item__meta">
                    {d.endTime}: {order.endTime}
                  </p>
                )}
                <p className="mobile-list-item__status">{order.status}</p>
                {order.alert && (
                  <p className="mobile-list-item__alert">⚠ {order.alert}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mobile-section dash-card">
        <h2 className="mobile-section__title">{d.finishingTitle}</h2>
        {finishingSoon.length === 0 ? (
          <p className="mobile-section__empty">{d.noFinishing}</p>
        ) : (
          <ul className="mobile-list">
            {finishingSoon.map((order) => (
              <li
                key={order.id}
                className={`mobile-list-item mobile-list-item--${order.company.toLowerCase()}`}
              >
                <div className="mobile-list-item__head">
                  <strong>{order.reference}</strong>
                  <span className={`dash-chip dash-chip--${order.company.toLowerCase()}`}>
                    {order.company}
                  </span>
                </div>
                {order.remainingLabel && (
                  <p className="mobile-list-item__meta mobile-list-item__meta--strong">
                    {order.remainingLabel}
                  </p>
                )}
                <p className="mobile-list-item__status">{order.status}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mobile-section dash-card">
        <h2 className="mobile-section__title">{d.alertsTitle}</h2>
        {alerts.length === 0 ? (
          <EmptyState
            icon={<Bell size={26} strokeWidth={1.5} />}
            title={d.noAlerts}
            description={d.statusStable}
          />
        ) : (
          <ul className="mobile-list">
            {alerts.map((alert) => (
              <li key={alert.id} className={`mobile-alert mobile-alert--${alert.severity}`}>
                <div className="mobile-alert__head">
                  <span className="mobile-alert__icon">{alert.icon}</span>
                  {alert.source && <span className="mobile-alert__source">{alert.source}</span>}
                  <span className="mobile-alert__time">{alert.time}</span>
                </div>
                <p className="mobile-alert__message">{alert.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mobile-section dash-card">
        <h2 className="mobile-section__title">{d.tablesSummaryTitle}</h2>
        <div className="mobile-summary-grid">
          <div className="mobile-summary-chip">
            <span className="mobile-summary-chip__value">{tableSummary.free}</span>
            <span className="mobile-summary-chip__label">{d.tablesFree}</span>
          </div>
          <div className="mobile-summary-chip">
            <span className="mobile-summary-chip__value">{tableSummary.occupied}</span>
            <span className="mobile-summary-chip__label">{d.tablesOccupied}</span>
          </div>
          <div className="mobile-summary-chip">
            <span className="mobile-summary-chip__value">{tableSummary.pendingValidation}</span>
            <span className="mobile-summary-chip__label">{d.tablesPending}</span>
          </div>
          <div className="mobile-summary-chip">
            <span className="mobile-summary-chip__value">{tableSummary.blocked}</span>
            <span className="mobile-summary-chip__label">{d.tablesBlocked}</span>
          </div>
          <div className="mobile-summary-chip">
            <span className="mobile-summary-chip__value">{tableSummary.manualInUse}</span>
            <span className="mobile-summary-chip__label">{d.tablesManualInUse}</span>
          </div>
          <div className="mobile-summary-chip">
            <span className="mobile-summary-chip__value">{tableSummary.automaticInUse}</span>
            <span className="mobile-summary-chip__label">{d.tablesAutomaticInUse}</span>
          </div>
        </div>
      </section>

      <section className="mobile-section dash-card">
        <h2 className="mobile-section__title">{d.occupancyTitle}</h2>
        <div className="mobile-occupancy">
          <LoadBar
            label={d.occupancyAutomatic}
            occupied={occupancy.automaticOccupied}
            total={occupancy.automaticTotal}
            accentClass="mobile-load-bar--auto"
          />
          <LoadBar
            label={d.occupancyManual}
            occupied={occupancy.manualOccupied}
            total={occupancy.manualTotal}
            accentClass="mobile-load-bar--manual"
          />
          <LoadBar
            label={d.occupancyPalletizers}
            occupied={occupancy.palletizersActive}
            total={occupancy.palletizersTotal}
            accentClass="mobile-load-bar--pallet"
          />
        </div>
      </section>

      <footer className="mobile-footer">
        <p className="mobile-footer__badge">{d.readOnlyBadge}</p>
        <p className="mobile-footer__hint">{d.readOnlyHint}</p>
      </footer>
    </div>
  )
}
