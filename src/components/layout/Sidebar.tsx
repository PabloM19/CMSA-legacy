import { NavLink } from 'react-router-dom'
import { CmsaLogo } from '../ui/CmsaLogo'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { getVisibleNavItems } from '../../utils/permissions'

export function Sidebar() {
  const { user } = useAuth()
  const { t } = useLanguage()

  if (!user) return null

  const navItems = getVisibleNavItems(user)

  return (
    <aside className="app-layout__sidebar">
      <div className="sidebar__brand">
        <CmsaLogo variant="light" size="sm" className="sidebar__logo" />
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
