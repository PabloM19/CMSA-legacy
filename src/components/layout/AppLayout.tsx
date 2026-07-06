import { Link, Outlet, useLocation } from 'react-router-dom'
import { CmsaBackgroundDecor } from './CmsaBackgroundDecor'
import { Header } from './Header'
import { MobileShell } from './MobileShell'
import { Sidebar } from './Sidebar'
import { LangSwitcher } from '../ui/LangSwitcher'
import { CmsaLogo } from '../ui/CmsaLogo'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import './public-layout.css'

const WIDE_ROUTES = new Set([
  '/daily-orders',
  '/production-orders',
  '/backlog',
  '/plant-map',
  '/performance',
])

function useWideContent(): boolean {
  const { pathname } = useLocation()
  return WIDE_ROUTES.has(pathname)
}

function GuestMobileLayout() {
  const { t } = useLanguage()

  return (
    <div className="public-layout cmsa-background">
      <CmsaBackgroundDecor />
      <header className="public-layout__header">
        <div className="public-layout__header-inner public-layout__header-inner--wide">
          <CmsaLogo variant="light" size="sm" className="public-layout__brand" />
          <div className="public-layout__actions">
            <LangSwitcher />
            <Link to="/login" className="public-layout__login ui-btn ui-btn--primary">
              {t.common.signIn}
            </Link>
          </div>
        </div>
      </header>
      <main className="public-layout__main">
        <div className="app-content app-content--wide">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export function AppLayout() {
  const breakpoint = useBreakpoint()
  const wide = useWideContent()
  const { isAuthenticated } = useAuth()

  if (breakpoint === 'mobile') {
    if (!isAuthenticated) {
      return <GuestMobileLayout />
    }
    return <MobileShell />
  }

  const contentClass = wide ? 'app-content app-content--wide' : 'app-content'

  return (
    <div className="app-layout cmsa-background">
      <CmsaBackgroundDecor />
      <Sidebar />
      <div className="app-layout__main">
        <Header wide={wide} />
        <main className="app-layout__content">
          <div className={contentClass}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
