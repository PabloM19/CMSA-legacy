import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { GeneralStatus } from '../../../types/dashboard'
import { formatHeaderDate } from '../../../utils/companyTheme'

interface DashboardStatusBarProps {
  generalStatus: GeneralStatus
}

function statusLabel(
  d: ReturnType<typeof useLanguage>['t']['dashboard'],
  status: GeneralStatus,
): string {
  switch (status) {
    case 'ok':
      return d.statusOk
    case 'warning':
      return d.statusWarning
    case 'critical':
      return d.statusCritical
  }
}

export function DashboardStatusBar({ generalStatus }: DashboardStatusBarProps) {
  const { user } = useAuth()
  const { t, dateLocale } = useLanguage()

  if (!user) return null

  const d = t.dashboard

  return (
    <div className="dash-status">
      <div className="dash-status__main">
        <h1 className="dash-status__title">{d.title}</h1>
        <div className="dash-status__meta">
          <span className="dash-status__item">
            <span className="dash-status__label">{d.date}</span>
            <time dateTime={new Date().toISOString()}>
              {formatHeaderDate(new Date(), dateLocale)}
            </time>
          </span>
          <span className="dash-status__divider" aria-hidden="true" />
          <span className="dash-status__item">
            <span className="dash-status__label">{d.user}</span>
            {user.name}
          </span>
          <span className="dash-status__divider" aria-hidden="true" />
          <span className="dash-status__item">
            <span className="dash-status__label">{d.colCompany}</span>
            <span className={`dash-chip dash-chip--${user.company.toLowerCase()}`}>
              {user.company}
            </span>
          </span>
          <span className="dash-status__divider" aria-hidden="true" />
          <span className="dash-status__item">
            <span className="dash-status__label">{d.role}</span>
            {t.roles[user.role]}
          </span>
        </div>
      </div>
      <div className="dash-status__health">
        <span className="dash-status__label">{d.generalStatus}</span>
        <span className={`dash-health dash-health--${generalStatus}`}>
          {statusLabel(d, generalStatus)}
        </span>
      </div>
    </div>
  )
}
