import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../../types/auth'
import { clearSession, getSession, setSession } from '../../utils/auth'
import { canAccessRoute, getDefaultRoute } from '../../utils/permissions'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  canAccess: (path: string) => boolean
  defaultRoute: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSession()?.user ?? null)

  const login = useCallback((loggedInUser: User) => {
    setSession(loggedInUser)
    setUser(loggedInUser)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const canAccess = useCallback(
    (path: string) => {
      if (!user) return false
      return canAccessRoute(user, path)
    },
    [user],
  )

  const defaultRoute = user ? getDefaultRoute(user) : '/login'

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
      canAccess,
      defaultRoute,
    }),
    [user, login, logout, canAccess, defaultRoute],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
