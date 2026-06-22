import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { LangSwitcher } from '../ui/LangSwitcher'
import { formatHeaderDate } from '../../utils/companyTheme'
import { UserMenu } from './UserMenu'

export function Header() {
  const { user, logout } = useAuth()
  const { dateLocale } = useLanguage()
  const navigate = useNavigate()

  if (!user) return null

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-layout__header">
      <time className="header__date" dateTime={new Date().toISOString()}>
        {formatHeaderDate(new Date(), dateLocale)}
      </time>
      <div className="header__actions">
        <LangSwitcher />
        <UserMenu user={user} onLogout={handleLogout} />
      </div>
    </header>
  )
}
