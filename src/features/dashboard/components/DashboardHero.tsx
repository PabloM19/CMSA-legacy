import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DashboardSnapshot } from '../../../types/dashboard'
import { formatHeaderDate } from '../../../utils/companyTheme'
import {
  countActiveAlerts,
  getHeroMessageKey,
} from '../../../utils/dashboardHelpers'

interface DashboardHeroProps {
  data: DashboardSnapshot
}

function HeroIcon({ status }: { status: DashboardSnapshot['generalStatus'] }) {
  if (status === 'ok') return <CheckCircle2 size={40} strokeWidth={1.5} />
  if (status === 'warning') return <AlertTriangle size={40} strokeWidth={1.5} />
  return <Activity size={40} strokeWidth={1.5} />
}

export function DashboardHero({ data }: DashboardHeroProps) {
  const { user } = useAuth()
  const { t, dateLocale } = useLanguage()
  const d = t.dashboard

  if (!user) return null

  const messageKey = getHeroMessageKey(data.generalStatus)
  const activeAlerts = countActiveAlerts(data.alerts)
  const pendingValidation = data.todayOrders.filter((o) => o.status === 'validation').length

  const summaryParts = [
    d.heroSummaryActive.replace('{active}', String(data.kpis.activeOrders)),
    d.heroSummaryValidation.replace('{validation}', String(pendingValidation)),
    d.heroSummaryAlerts.replace('{alerts}', String(activeAlerts)),
    d.heroSummaryOccupied.replace('{occupied}', String(data.kpis.occupiedTables)),
  ]

  return (
    <section className={`dash-hero dash-hero--${data.generalStatus}`}>
      <div className="dash-hero__main">
        <div className="dash-hero__icon" aria-hidden="true">
          <HeroIcon status={data.generalStatus} />
        </div>
        <div className="dash-hero__content">
          <p className="dash-hero__label">{d.generalStatus}</p>
          <h1 className="dash-hero__title">{d[messageKey]}</h1>
          <p className="dash-hero__summary">{summaryParts.join(' · ')}</p>
          <div className="dash-hero__meta">
            <time dateTime={new Date().toISOString()}>
              {formatHeaderDate(new Date(), dateLocale)}
            </time>
            <span className="dash-hero__dot">·</span>
            <span>{user.name}</span>
            <span className={`dash-chip dash-chip--${user.company.toLowerCase()}`}>
              {user.company}
            </span>
            <span className="dash-hero__dot">·</span>
            <span>{t.roles[user.role]}</span>
          </div>
        </div>
      </div>
      <span className="ui-mock-badge dash-hero__badge">{t.common.mockBadge}</span>
    </section>
  )
}
