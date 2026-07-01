// @refresh reset — evita instancias duplicadas del contexto tras HMR en Vite
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../features/auth/AuthContext'
import {
  applyThemeToDocument,
  readStoredTheme,
  saveStoredTheme,
  type Theme,
} from './themeStorage'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function resolveThemeForUser(username: string | undefined): Theme {
  if (!username) return 'light'
  return readStoredTheme(username)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const username = user?.username

  const [theme, setThemeState] = useState<Theme>(() => resolveThemeForUser(username))

  useEffect(() => {
    setThemeState(resolveThemeForUser(username))
  }, [username])

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next)
      if (username) {
        saveStoredTheme(username, next)
      }
    },
    [username],
  )

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [setTheme, theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark',
    }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}
