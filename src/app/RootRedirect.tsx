import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

export function RootRedirect() {
  const { isAuthenticated, defaultRoute } = useAuth()
  return <Navigate to={isAuthenticated ? defaultRoute : '/login'} replace />
}
