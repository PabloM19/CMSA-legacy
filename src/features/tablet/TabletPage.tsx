import { Navigate } from 'react-router-dom'

/** @deprecated Usar /plant-map — se adapta al ancho automáticamente */
export function TabletPage() {
  return <Navigate to="/plant-map" replace />
}
