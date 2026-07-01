import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Factory,
  LayoutGrid,
  Map,
  Package,
  Pause,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { getState } from '../../utils/backlogStorage'
import { getMobileDateTime } from '../../utils/mobileHelpers'
import {
  computeMobileHeroStats,
  computeMobileQuickStats,
  computeMobileTableSummary,
  enrichActiveOrder,
  findOrderById,
  getMobileCompanyCards,
  getMobileFinishingLimited,
  getMobileGeneralStatus,
  getMobileHeaderLine,
  getMobileHeroMessage,
  getMobileProductionLimited,
  mapMobileAlertsSoft,
} from '../../utils/mobileViewHelpers'
import { MobileOrderDrawer } from './components/MobileOrderDrawer'
import { MobilePageSkeleton } from './components/MobilePageSkeleton'
import './mobile.css'

function HeroIcon({ status }: { status: 'ok' | 'warning' | 'critical' }) {
  if (status === 'critical') return <AlertTriangle size={40} strokeWidth={1.5} />
  if (status === 'warning') return <Pause size={40} strokeWidth={1.5} />
  return <CheckCircle2 size={40} strokeWidth={1.5} />
}

export function MobilePage() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.mobile
  const plant = t.plantMap

  const [state, setState] = useState(() => getState())
  const [dateTime, setDateTime] = useState(() => getMobileDateTime(lang))
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    setState(getState())
    setDateTime(getMobileDateTime(lang))
    const loadTimer = window.setTimeout(() => setLoading(false), 320)
    const clockTimer = window.setInterval(() => setDateTime(getMobileDateTime(lang)), 60000)
    return () => {
      window.clearTimeout(loadTimer)
      window.clearInterval(clockTimer)
    }
  }, [lang])

  const generalStatus = useMemo(() => getMobileGeneralStatus(state), [state])
  const heroMessage = useMemo(() => getMobileHeroMessage(generalStatus, lang), [generalStatus, lang])
  const heroStats = useMemo(
    () => (user ? computeMobileHeroStats(state, user) : null),
    [state, user],
  )
  const quickStats = useMemo(
    () => (user ? computeMobileQuickStats(state, user) : null),
    [state, user],
  )
  const production = useMemo(
    () => (user ? getMobileProductionLimited(state, user, lang) : { items: [], total: 0, moreCount: 0 }),
    [state, user, lang],
  )
  const alerts = useMemo(
    () => (user ? mapMobileAlertsSoft(state, user, lang, d, plant) : []),
    [state, user, lang, d, plant],
  )
  const finishing = useMemo(
    () => (user ? getMobileFinishingLimited(state, user, lang) : []),
    [state, user, lang],
  )
  const tableSummary = useMemo(() => computeMobileTableSummary(state), [state])
  const companyCards = useMemo(
    () => (user ? getMobileCompanyCards(state, user) : []),
    [state, user],
  )

  const selectedOrder = selectedOrderId ? findOrderById(state, selectedOrderId) ?? null : null

  if (!user) return null

  if (loading) {
    return <MobilePageSkeleton />
  }

  const headerLine = getMobileHeaderLine(user, d)

  const quickItems = [
    { label: d.quickProduction, value: quickStats?.inProduction ?? 0, icon: Factory, tone: 'brand' },
    { label: d.quickPending, value: quickStats?.pending ?? 0, icon: Clock, tone: 'pending' },
    { label: d.quickAlerts, value: quickStats?.alerts ?? 0, icon: AlertTriangle, tone: 'warn' },
    { label: d.quickOccupied, value: quickStats?.occupiedTables ?? 0, icon: LayoutGrid, tone: 'neutral' },
  ] as const

  return (
    <div className="mobile-v2">
      <header className="mobile-v2-header" id="mobile-top">
        <div className="mobile-v2-header__top">
          <div>
            <h1 className="mobile-v2-header__title">{d.title}</h1>
            <p className="mobile-v2-header__subtitle">{d.subtitle}</p>
          </div>
          <span className="mobile-v2-badge">{d.consultBadge}</span>
        </div>
        <div className="mobile-v2-header__meta">
          <time className="mobile-v2-header__time">{dateTime}</time>
          <span className="mobile-v2-header__role">{headerLine}</span>
        </div>
        <p className="mobile-v2-header__user">
          {user.name} · {t.roles[user.role]}
        </p>
      </header>

      <section className={`mobile-v2-hero dash-card mobile-v2-hero--${generalStatus}`}>
        <div className="mobile-v2-hero__icon" aria-hidden="true">
          <HeroIcon status={generalStatus} />
        </div>
        <p className="mobile-v2-hero__message">{heroMessage}</p>
        <div className="mobile-v2-hero__stats">
          <div>
            <strong>{heroStats?.inProduction ?? 0}</strong>
            <span>{d.heroInProduction}</span>
          </div>
          <div>
            <strong>{heroStats?.activeAlerts ?? 0}</strong>
            <span>{d.heroAlerts}</span>
          </div>
          <div>
            <strong>{heroStats?.occupiedTables ?? 0}</strong>
            <span>{d.heroOccupied}</span>
          </div>
          <div>
            <strong>{heroStats?.finishingSoon ?? 0}</strong>
            <span>{d.heroFinishing}</span>
          </div>
        </div>
      </section>

      <section className="mobile-v2-quick" aria-label={d.quickSummaryTitle}>
        <div className="mobile-v2-quick__grid">
          {quickItems.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.label} className={`mobile-v2-quick__card dash-card mobile-v2-quick__card--${item.tone}`}>
                <span className="mobile-v2-quick__icon" aria-hidden="true">
                  <Icon size={28} strokeWidth={1.5} />
                </span>
                <span className="mobile-v2-quick__value">{item.value}</span>
                <span className="mobile-v2-quick__label">{item.label}</span>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mobile-v2-section dash-card" id="mobile-production">
        <h2 className="mobile-v2-section__title">{d.activeProductionTitle}</h2>
        {production.items.length === 0 ? (
          <p className="mobile-v2-empty">{d.noActiveProduction}</p>
        ) : (
          <ul className="mobile-v2-list">
            {production.items.map((order) => {
              const raw = findOrderById(state, order.id)
              const enriched = enrichActiveOrder(order, raw)
              return (
                <li key={order.id} className={`mobile-v2-card mobile-v2-card--${order.company.toLowerCase()}`}>
                  <div className="mobile-v2-card__head">
                    <strong>{order.reference}</strong>
                    <span className={`dash-chip dash-chip--${order.company.toLowerCase()}`}>{order.company}</span>
                  </div>
                  <p className="mobile-v2-card__product">{enriched.productLine}</p>
                  <p className="mobile-v2-card__meta">
                    {d.tables}: {order.tables || '—'}
                  </p>
                  {order.remainingLabel && (
                    <p className="mobile-v2-card__highlight">{order.remainingLabel}</p>
                  )}
                  {order.endTime && (
                    <p className="mobile-v2-card__meta">
                      {d.endTime}: {order.endTime}
                    </p>
                  )}
                  <p className="mobile-v2-card__status">{d.statusInExecution}</p>
                  <button
                    type="button"
                    className="mobile-v2-link-btn"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    {d.viewDetail}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {production.moreCount > 0 && (
          <Link to="/dashboard" className="mobile-v2-more-link">
            {d.moreProduction.replace('{count}', String(production.moreCount))}
          </Link>
        )}
      </section>

      <section className="mobile-v2-section dash-card" id="mobile-alerts">
        <h2 className="mobile-v2-section__title">{d.alertsTitle}</h2>
        {alerts.length === 0 ? (
          <p className="mobile-v2-empty">{d.noAlertsActive}</p>
        ) : (
          <ul className="mobile-v2-list">
            {alerts.slice(0, 3).map((alert) => (
              <li key={alert.id} className={`mobile-v2-alert mobile-v2-alert--${alert.severity}`}>
                <span className="mobile-v2-alert__icon" aria-hidden="true">
                  {alert.icon}
                </span>
                <div className="mobile-v2-alert__body">
                  {alert.source && <span className="mobile-v2-alert__source">{alert.source}</span>}
                  <p className="mobile-v2-alert__message">{alert.message}</p>
                  <span className="mobile-v2-alert__time">{alert.time}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mobile-v2-section dash-card" id="mobile-finishing">
        <h2 className="mobile-v2-section__title">{d.finishingTitle}</h2>
        {finishing.length === 0 ? (
          <p className="mobile-v2-empty">{d.noFinishingActive}</p>
        ) : (
          <ul className="mobile-v2-list">
            {finishing.map((order) => (
              <li key={order.id} className={`mobile-v2-card mobile-v2-card--${order.company.toLowerCase()}`}>
                <div className="mobile-v2-card__head">
                  <strong>{order.reference}</strong>
                  <span className={`dash-chip dash-chip--${order.company.toLowerCase()}`}>{order.company}</span>
                </div>
                {order.remainingLabel && (
                  <p className="mobile-v2-card__highlight">{order.remainingLabel}</p>
                )}
                {order.endTime && (
                  <p className="mobile-v2-card__meta">
                    {d.endTime}: {order.endTime}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mobile-v2-section dash-card" id="mobile-tables">
        <h2 className="mobile-v2-section__title">{d.tablesSectionTitle}</h2>
        <div className="mobile-v2-tables-grid">
          <div className="mobile-v2-tables-chip">
            <span className="mobile-v2-tables-chip__value">{tableSummary.free}</span>
            <span className="mobile-v2-tables-chip__label">{d.tablesFree}</span>
          </div>
          <div className="mobile-v2-tables-chip">
            <span className="mobile-v2-tables-chip__value">{tableSummary.occupied}</span>
            <span className="mobile-v2-tables-chip__label">{d.tablesOccupied}</span>
          </div>
          <div className="mobile-v2-tables-chip">
            <span className="mobile-v2-tables-chip__value">{tableSummary.pendingValidation}</span>
            <span className="mobile-v2-tables-chip__label">{d.tablesPending}</span>
          </div>
          <div className="mobile-v2-tables-chip">
            <span className="mobile-v2-tables-chip__value">{tableSummary.blocked}</span>
            <span className="mobile-v2-tables-chip__label">{d.tablesBlockedConflict}</span>
          </div>
        </div>
        <Link to="/plant-map" className="mobile-v2-btn mobile-v2-btn--map">
          <Map size={18} aria-hidden="true" />
          {d.viewPlantMap}
        </Link>
      </section>

      {companyCards.length > 0 && (
        <section className="mobile-v2-section dash-card" id="mobile-capacity">
          <h2 className="mobile-v2-section__title">{d.capacityTitle}</h2>
          <div className="mobile-v2-company-list">
            {companyCards.map((item, index) => (
              <article
                key={item.company}
                className={`mobile-v2-company mobile-v2-company--${item.company.toLowerCase()}${index === 0 ? ' mobile-v2-company--primary' : ''}`}
              >
                <div className="mobile-v2-company__head">
                  <Package size={22} aria-hidden="true" />
                  <strong>{item.company}</strong>
                  {index > 0 && user.role !== 'superadmin' && (
                    <span className="mobile-v2-company__tag">{d.otherCompany}</span>
                  )}
                </div>
                <div className="mobile-v2-company__capacity">
                  <span>{item.loadPercent}%</span>
                  <small>{d.capacityUsed}</small>
                </div>
                <div className="mobile-v2-company__bar">
                  <div style={{ width: `${item.loadPercent}%` }} />
                </div>
                <p className="mobile-v2-company__meta">
                  {d.activeOrders}: <strong>{item.activeOrders}</strong>
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <nav className="mobile-v2-nav" aria-label={d.bottomNavLabel}>
        <a href="#mobile-top" className="mobile-v2-nav__item">{d.navStatus}</a>
        <a href="#mobile-production" className="mobile-v2-nav__item">{d.navProduction}</a>
        <a href="#mobile-alerts" className="mobile-v2-nav__item">{d.navAlerts}</a>
        <Link to="/plant-map" className="mobile-v2-nav__item">{d.navMap}</Link>
      </nav>

      <footer className="mobile-v2-footer">
        <p className="mobile-v2-footer__badge">{d.readOnlyBadge}</p>
        <p className="mobile-v2-footer__hint">{d.readOnlyHint}</p>
      </footer>

      <MobileOrderDrawer order={selectedOrder} onClose={() => setSelectedOrderId(null)} />
    </div>
  )
}
