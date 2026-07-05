import { Navigate } from 'react-router-dom'

/** Compatibilidad: /backlog redirige a pedidos del día. */
export function BacklogPage() {
  return <Navigate to="/daily-orders" replace />
}
