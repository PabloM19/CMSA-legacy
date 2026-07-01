import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './styles/plant-tables.css'
import App from './app/App'
import { registerDemoConsoleApi } from './utils/demoSeed'
import { getSession } from './utils/auth'
import { applyThemeToDocument, readStoredTheme } from './theme/themeStorage'

registerDemoConsoleApi()

const session = getSession()
applyThemeToDocument(
  session?.user ? readStoredTheme(session.user.username) : 'light',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
