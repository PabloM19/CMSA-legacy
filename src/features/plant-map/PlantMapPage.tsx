import { useBreakpoint } from '../../hooks/useBreakpoint'
import { PlantMapDesktopView } from './views/PlantMapDesktopView'
import { PlantMapMobileView } from './views/PlantMapMobileView'
import { PlantMapTabletView } from './views/PlantMapTabletView'

/**
 * Mapa de planta responsive: una sola ruta, tres layouts según ancho.
 * - ≥1100px → escritorio (pictograma completo + leyenda)
 * - 768–1099px → tablet (pictograma táctil + paneles)
 * - <768px → móvil (consulta compacta, solo lectura)
 */
export function PlantMapPage() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <PlantMapMobileView />
  if (breakpoint === 'tablet') return <PlantMapTabletView />
  return <PlantMapDesktopView />
}
