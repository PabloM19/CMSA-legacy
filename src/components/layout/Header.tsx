import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useLogout } from '../../features/auth/useLogout'
import { useLanguage } from '../../i18n/LanguageContext'
import { LangSwitcher } from '../ui/LangSwitcher'
import { formatHeaderDate } from '../../utils/companyTheme'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  wide?: boolean
}

export function Header({ wide = false }: HeaderProps) {
  const { user } = useAuth()
  const { t, dateLocale } = useLanguage()
  const handleLogout = useLogout()

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
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <Link to="/login" className="header__login ui-btn ui-btn--primary ui-btn--sm">
              {t.common.signIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
