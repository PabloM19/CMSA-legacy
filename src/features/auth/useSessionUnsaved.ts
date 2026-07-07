import { useEffect } from 'react'
import { registerSessionUnsaved } from '../../utils/sessionGuard'

/** Marca cambios sin guardar para impedir cierre de sesión por inactividad. */
export function useSessionUnsaved(active: boolean): void {
  useEffect(() => {
    if (!active) return
    return registerSessionUnsaved()
  }, [active])
}
