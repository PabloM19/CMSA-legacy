import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { getCompanyThemeClass } from '../../utils/companyTheme'
import { getVisibleNavItems } from '../../utils/permissions'

export function Sidebar() {
  const { user } = useAuth()
  const { t } = useLanguage()

  if (!user) return null

  const navItems = getVisibleNavItems(user)
  const themeClass = getCompanyThemeClass(user.company)

  return (
    <aside className={`app-layout__sidebar ${themeClass}`}>
      <div className="sidebar__brand">
        <div className="sidebar__brand-title">CMSA</div>
        <div className="sidebar__brand-subtitle">{t.common.wireframeSubtitle}</div>
      </div>
      <nav className="sidebar__nav">
        {navItems.map(({ to, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            {t.nav[key]}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
