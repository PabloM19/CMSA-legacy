import { useAuth } from '../../features/auth/AuthContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { PlantMapDesktopView } from './views/PlantMapDesktopView'
import { PlantMapMobileView } from './views/PlantMapMobileView'
import { PlantMapTabletView } from './views/PlantMapTabletView'

/**
 * Mapa de planta responsive: una sola ruta, tres layouts según ancho.
 * Sin sesión: vista pública de escritorio (mapa + resumen + avisos) en todos los anchos.
 */
export function PlantMapPage() {
  const { isAuthenticated } = useAuth()
  const breakpoint = useBreakpoint()

  if (!isAuthenticated) {
    return <PlantMapDesktopView />
  }

  if (breakpoint === 'mobile') return <PlantMapMobileView />
  if (breakpoint === 'tablet') return <PlantMapTabletView />
  return <PlantMapDesktopView />
}
