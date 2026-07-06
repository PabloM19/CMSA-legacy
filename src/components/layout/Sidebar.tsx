import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  BookOpen,
  Factory,
  ListOrdered,
  LogIn,
  Map,
  Menu,
  PanelLeftClose,
  PlusCircle,
  ShieldCheck,
  UserCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CmsaLogo } from '../ui/CmsaLogo'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { NavKey } from '../../i18n/translations'
import { getGuestNavItems, getVisibleNavItems } from '../../utils/permissions'
import {
  readGuestSidebarCollapsed,
  readSidebarCollapsed,
  saveGuestSidebarCollapsed,
  saveSidebarCollapsed,
} from '../../utils/sidebarPrefs'
import './sidebar.css'

const NAV_ICONS: Record<NavKey, LucideIcon> = {
  newOrder: PlusCircle,
  dailyOrders: ListOrdered,
  productionOrders: Factory,
  plantMap: Map,
  performance: BarChart3,
  references: BookOpen,
  alarms: Bell,
  admin: ShieldCheck,
  profile: UserCircle,
  tablet: Map,
  mobile: Map,
}

export function Sidebar() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)
  const isGuest = !user

  useEffect(() => {
    if (isGuest) {
      setCollapsed(readGuestSidebarCollapsed())
      return
    }
    setCollapsed(readSidebarCollapsed(user.username))
  }, [user, isGuest])

  const navItems = isGuest ? getGuestNavItems() : getVisibleNavItems(user)

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      if (isGuest) {
        saveGuestSidebarCollapsed(next)
      } else {
        saveSidebarCollapsed(user.username, next)
      }
      return next
    })
  }

  return (
    <aside
      className={`app-layout__sidebar${collapsed ? ' app-layout__sidebar--collapsed' : ''}`}
      aria-label={t.common.sidebarNavLabel}
    >
      <div className="sidebar__head">
        {collapsed ? (
          <div className="sidebar__brand sidebar__brand--compact">
            <span className="sidebar__brand-mark" aria-hidden="true">
              CMSA
            </span>
          </div>
        ) : (
          <div className="sidebar__brand">
            <CmsaLogo variant="light" size="sm" className="sidebar__logo" />
            <div className="sidebar__brand-subtitle">{t.common.wireframeSubtitle}</div>
          </div>
        )}

        <button
          type="button"
          className="sidebar__toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t.common.sidebarExpand : t.common.sidebarCollapse}
        >
          {collapsed ? <Menu size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(({ to, key }) => {
          const Icon = NAV_ICONS[key]
          const label = t.nav[key]

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <span className="sidebar__link-icon" aria-hidden="true">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="sidebar__link-label">{label}</span>
              {collapsed && (
                <span className="sidebar__tooltip" role="tooltip">
                  {label}
                </span>
              )}
            </NavLink>
          )
        })}

        {isGuest && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `sidebar__link sidebar__link--sign-in${isActive ? ' sidebar__link--active' : ''}`
            }
            title={collapsed ? t.common.signIn : undefined}
          >
            <span className="sidebar__link-icon" aria-hidden="true">
              <LogIn size={20} strokeWidth={2} />
            </span>
            <span className="sidebar__link-label">{t.common.signIn}</span>
            {collapsed && (
              <span className="sidebar__tooltip" role="tooltip">
                {t.common.signIn}
              </span>
            )}
          </NavLink>
        )}
      </nav>

      <footer className="sidebar__footer">
        <span className="sidebar__phase">{t.common.sidebarPhase}</span>
      </footer>
    </aside>
  )
}
