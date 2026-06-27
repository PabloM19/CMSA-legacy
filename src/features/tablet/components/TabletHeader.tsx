import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { TabletGeneralStatus } from '../../../utils/tabletHelpers'

interface TabletHeaderProps {
  generalStatus: TabletGeneralStatus
}

export function TabletHeader({ generalStatus }: TabletHeaderProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.tablet

  const statusLabel =
    generalStatus === 'critical'
      ? d.statusCritical
      : generalStatus === 'warning'
        ? d.statusWarning
        : d.statusOk

  return (
    <header className="tablet-header dash-card">
      <div className="tablet-header__main">
        <h1 className="tablet-header__title">{d.title}</h1>
        <p className="tablet-header__subtitle">{d.subtitle}</p>
      </div>
      {user && (
        <div className="tablet-header__meta">
          <span className="tablet-header__user">{user.name}</span>
          <span className="tablet-header__role">{t.roles[user.role]}</span>
          <span className={`dash-chip dash-chip--${user.company.toLowerCase()}`}>
            {user.company}
          </span>
          <span
            className={`tablet-header__status tablet-header__status--${generalStatus}`}
          >
            {d.generalStatus}: {statusLabel}
          </span>
        </div>
      )}
    </header>
  )
}
