import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'

export function TabletHeader() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.tablet

  return (
    <header className="tablet-header">
      <div className="tablet-header__main">
        <h1 className="tablet-header__title">{d.title}</h1>
        <p className="tablet-header__subtitle">{d.subtitle}</p>
      </div>
      {user && (
        <div className="tablet-header__meta">
          <span className="tablet-header__user">{user.name}</span>
          <span className="tablet-header__role">{t.roles[user.role]}</span>
          <span className={`tablet-chip tablet-chip--${user.company.toLowerCase()}`}>
            {user.company}
          </span>
        </div>
      )}
    </header>
  )
}
