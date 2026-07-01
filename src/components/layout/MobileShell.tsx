import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { LangSwitcher } from '../ui/LangSwitcher'
import { getMobileNavItems } from '../../utils/permissions'
import { CmsaBackgroundDecor } from './CmsaBackgroundDecor'
import './mobile-shell.css'

export function MobileShell() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  if (!user) return null

  const navItems = getMobileNavItems(user)

  function handleLogout() {
    setDrawerOpen(false)
    logout()
    navigate('/plant-map', { replace: true })
  }

  return (
    <div className="mobile-shell cmsa-background">
      <CmsaBackgroundDecor />
      <header className="mobile-shell__topbar">
        <button
          type="button"
          className="mobile-shell__menu-btn"
          aria-label={t.mobile.menuOpen}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          {drawerOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
        <div className="mobile-shell__brand">
          <span className="mobile-shell__brand-name">{t.mobile.brand}</span>
          <span className="mobile-shell__brand-tag">{t.mobile.monitorTag}</span>
        </div>
        <LangSwitcher />
      </header>

      {drawerOpen && (
        <button
          type="button"
          className="mobile-shell__backdrop"
          aria-label={t.mobile.menuClose}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <aside
        className={`mobile-shell__drawer${drawerOpen ? ' mobile-shell__drawer--open' : ''}`}
        aria-hidden={!drawerOpen}
      >
        <div className="mobile-shell__drawer-head">
          <p className="mobile-shell__drawer-user">{user.name}</p>
          <p className="mobile-shell__drawer-meta">
            {user.company} · {t.roles[user.role]}
          </p>
        </div>
        <nav className="mobile-shell__nav">
          {navItems.map(({ to, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `mobile-shell__nav-link${isActive ? ' mobile-shell__nav-link--active' : ''}`
              }
              onClick={() => setDrawerOpen(false)}
            >
              {t.nav[key]}
            </NavLink>
          ))}
        </nav>
        <p className="mobile-shell__drawer-note">{t.mobile.navReadOnlyNote}</p>
        <button type="button" className="mobile-shell__logout" onClick={handleLogout}>
          {t.common.logout}
        </button>
      </aside>

      <main className="mobile-shell__content">
        <Outlet />
      </main>
    </div>
  )
}
