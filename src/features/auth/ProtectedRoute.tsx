import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, user, canAccess, defaultRoute } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!canAccess(location.pathname)) {
    return <Navigate to={defaultRoute} replace />
  }

  return <Outlet />
}
