import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import {
  formatHeaderDate,
  getCompanyThemeClass,
  getRoleLabel,
} from '../../utils/companyTheme'

export function Header() {
  const { user, logout } = useAuth()
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
        <span className={`header__badge header__badge--company`}>{user.company}</span>
        <span className="header__role">{getRoleLabel(user.role)}</span>
        <time className="header__date" dateTime={new Date().toISOString()}>
          {formatHeaderDate(new Date())}
        </time>
      </div>
      <button type="button" className="header__logout" onClick={handleLogout}>
        Salir
      </button>
    </header>
  )
}
