import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { MobileShell } from './MobileShell'
import { Sidebar } from './Sidebar'
import { useBreakpoint } from '../../hooks/useBreakpoint'

const WIDE_ROUTES = new Set(['/backlog', '/plant-map'])

function useWideContent(): boolean {
  const { pathname } = useLocation()
  return WIDE_ROUTES.has(pathname)
}

export function AppLayout() {
  const breakpoint = useBreakpoint()
  const wide = useWideContent()

  if (breakpoint === 'mobile') {
    return <MobileShell />
  }

  const contentClass = wide ? 'app-content app-content--wide' : 'app-content'

  return (
    <div className="app-layout">
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
