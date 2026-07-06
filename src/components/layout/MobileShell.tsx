import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  BookOpen,
  Factory,
  ListOrdered,
  LogIn,
  Map,
  Menu,
  PlusCircle,
  ShieldCheck,
  UserCircle,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useLogout } from '../../features/auth/useLogout'
import { useLanguage } from '../../i18n/LanguageContext'
import type { NavKey } from '../../i18n/translations'
import { LangSwitcher } from '../ui/LangSwitcher'
import { getGuestNavItems, getMobileNavItems } from '../../utils/permissions'
import { CmsaBackgroundDecor } from './CmsaBackgroundDecor'
import './mobile-shell.css'

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

export function MobileShell() {
  const { user } = useAuth()
  const handleLogout = useLogout()
  const { t } = useLanguage()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isGuest = !user
  const navItems = isGuest ? getGuestNavItems() : getMobileNavItems(user)

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [drawerOpen])

  function onLogout() {
    setDrawerOpen(false)
    handleLogout()
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  return (
    <div className="mobile-shell cmsa-background">
      <CmsaBackgroundDecor />
      <header className="mobile-shell__topbar">
        <button
          type="button"
          className="mobile-shell__menu-btn"
          aria-label={t.mobile.navOpen}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          <Menu size={22} strokeWidth={2} aria-hidden="true" />
        </button>
        <div className="mobile-shell__brand">
          <img
            src="/logos/iso.jpg"
            alt=""
            className="mobile-shell__brand-logo"
            width={36}
            height={36}
          />
          <span className="mobile-shell__brand-tag">{t.mobile.monitorTag}</span>
        </div>
        <div className="mobile-shell__topbar-actions">
          <LangSwitcher />
        </div>
      </header>

      {drawerOpen && (
        <button
          type="button"
          className="mobile-shell__backdrop"
          aria-label={t.mobile.menuClose}
          onClick={closeDrawer}
        />
      )}

      <aside
        className={`mobile-shell__drawer${drawerOpen ? ' mobile-shell__drawer--open' : ''}`}
        aria-hidden={!drawerOpen}
        aria-label={t.common.sidebarNavLabel}
      >
        <div className="mobile-shell__drawer-head">
          <div className="mobile-shell__drawer-head-text">
            {isGuest ? (
              <>
                <img
                  src="/logos/iso.jpg"
                  alt=""
                  className="mobile-shell__drawer-logo"
                  width={40}
                  height={40}
                />
                <p className="mobile-shell__drawer-meta">{t.mobile.guestNavHint}</p>
              </>
            ) : (
              <>
                <p className="mobile-shell__drawer-user">{user.name}</p>
                <p className="mobile-shell__drawer-meta">
                  {user.company} · {t.roles[user.role]}
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            className="mobile-shell__drawer-close"
            onClick={closeDrawer}
            aria-label={t.mobile.menuClose}
          >
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <nav className="mobile-shell__nav">
          {navItems.map(({ to, key }) => {
            const Icon = NAV_ICONS[key]
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `mobile-shell__nav-link${isActive ? ' mobile-shell__nav-link--active' : ''}`
                }
                onClick={closeDrawer}
              >
                <span className="mobile-shell__nav-icon" aria-hidden="true">
                  <Icon size={20} strokeWidth={2} />
                </span>
                {t.nav[key]}
              </NavLink>
            )
          })}
        </nav>

        {!isGuest && (
          <p className="mobile-shell__drawer-note">{t.mobile.navReadOnlyNote}</p>
        )}

        <div className="mobile-shell__drawer-foot">
          <div className="mobile-shell__drawer-lang">
            <LangSwitcher />
          </div>
          {isGuest ? (
            <Link to="/login" className="mobile-shell__sign-in" onClick={closeDrawer}>
              <LogIn size={18} strokeWidth={2} aria-hidden="true" />
              {t.common.signIn}
            </Link>
          ) : (
            <button type="button" className="mobile-shell__logout" onClick={onLogout}>
              {t.common.logout}
            </button>
          )}
        </div>
      </aside>

      <main className="mobile-shell__content">
        <Outlet />
      </main>
    </div>
  )
}
