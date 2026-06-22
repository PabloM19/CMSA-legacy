import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { LangSwitcher } from '../ui/LangSwitcher'
import { formatHeaderDate, getCompanyThemeClass } from '../../utils/companyTheme'

export function Header() {
  const { user, logout } = useAuth()
  const { t, dateLocale } = useLanguage()
  const navigate = useNavigate()

  if (!user) return null

  const themeClass = getCompanyThemeClass(user.company)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className={`app-layout__header ${themeClass}`}>
      <div className="header__info">
        <span className="header__user-name">{user.name}</span>
        <span className="header__badge header__badge--company">{user.company}</span>
        <span className="header__role">{t.roles[user.role]}</span>
        <time className="header__date" dateTime={new Date().toISOString()}>
          {formatHeaderDate(new Date(), dateLocale)}
        </time>
      </div>
      <div className="header__actions">
        <LangSwitcher />
        <button type="button" className="header__logout" onClick={handleLogout}>
          {t.common.logout}
        </button>
      </div>
    </header>
  )
}
