import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** Cierra sesión y vuelve al mapa de planta público (sin login). */
export function useLogout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return useCallback(() => {
    navigate('/plant-map', { replace: true })
    logout()
  }, [logout, navigate])
}
