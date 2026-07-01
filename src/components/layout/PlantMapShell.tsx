import { useAuth } from '../../features/auth/AuthContext'
import { AppLayout } from './AppLayout'
import { PublicLayout } from './PublicLayout'

/** Mapa de planta: layout público sin sesión, layout completo con sesión. */
export function PlantMapShell() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <PublicLayout />
  }

  return <AppLayout />
}
