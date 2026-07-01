import { Navigate } from 'react-router-dom'

export function DashboardRedirect() {
  return <Navigate to="/plant-map" replace />
}

export function ValidationRedirect() {
  return <Navigate to="/plant-map" replace />
}
