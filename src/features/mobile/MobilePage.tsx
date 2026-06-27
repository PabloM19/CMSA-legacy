import { Navigate } from 'react-router-dom'

/** @deprecated Usar /plant-map — se adapta al ancho automáticamente */
export function MobilePage() {
  return <Navigate to="/plant-map" replace />
}
