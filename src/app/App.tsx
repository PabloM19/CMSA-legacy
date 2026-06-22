import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../features/auth/AuthContext'
import { LanguageProvider } from '../i18n/LanguageContext'
import { router } from './routes'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </LanguageProvider>
  )
}
