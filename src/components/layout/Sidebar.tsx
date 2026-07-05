import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  BookOpen,
  Factory,
  ListOrdered,
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
import { getVisibleNavItems } from '../../utils/permissions'
import { readSidebarCollapsed, saveSidebarCollapsed } from '../../utils/sidebarPrefs'
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

  useEffect(() => {
    if (!user) return
    setCollapsed(readSidebarCollapsed(user.username))
  }, [user])

  if (!user) return null

  const username = user.username
  const navItems = getVisibleNavItems(user)

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      saveSidebarCollapsed(username, next)
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
              title={collapsed ? undefined : label}
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
      </nav>

      <footer className="sidebar__footer">
        <span className="sidebar__phase">{t.common.sidebarPhase}</span>
      </footer>
    </aside>
  )
}
