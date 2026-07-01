import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../features/auth/AuthContext'
import { LanguageProvider } from '../i18n/LanguageContext'
import { ThemeProvider } from '../theme/ThemeContext'

/** Providers compartidos por todas las rutas (dentro del router para evitar desincronía con HMR). */
export function AppProviders() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}
