import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { MobileShell } from './MobileShell'
import { Sidebar } from './Sidebar'
import { useBreakpoint } from '../../hooks/useBreakpoint'

export function AppLayout() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') {
    return <MobileShell />
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout__main">
        <Header />
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
