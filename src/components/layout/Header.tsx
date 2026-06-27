import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { LangSwitcher } from '../ui/LangSwitcher'
import { formatHeaderDate } from '../../utils/companyTheme'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  wide?: boolean
}

export function Header({ wide = false }: HeaderProps) {
  const { user, logout } = useAuth()
  const { dateLocale } = useLanguage()
  const navigate = useNavigate()

  if (!user) return null

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const innerClass = wide
    ? 'app-layout__header-inner app-layout__header-inner--wide'
    : 'app-layout__header-inner'

  return (
    <header className="app-layout__header">
      <div className={innerClass}>
        <time className="header__date" dateTime={new Date().toISOString()}>
          {formatHeaderDate(new Date(), dateLocale)}
        </time>
        <div className="header__actions">
          <LangSwitcher />
          <UserMenu user={user} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  )
}
