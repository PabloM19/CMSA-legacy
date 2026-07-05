import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CmsaBackgroundDecor } from '../../components/layout/CmsaBackgroundDecor'
import { LangSwitcher } from '../../components/ui/LangSwitcher'
import { getVisibleMockCredentials } from '../../data/mockUsers'
import { useLanguage } from '../../i18n/LanguageContext'
import { authenticate, getPostLoginPath } from '../../utils/auth'
import { readUserPreferences } from '../../utils/userPreferences'
import { useAuth } from './AuthContext'
import './login.css'

const LOGIN_DELAY_MS = 600

function UserIcon() {
  return (
    <svg className="login-card__input-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="login-card__input-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login, defaultRoute } = useAuth()
  const { t, setLang } = useLanguage()
  const copy = t.login

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(defaultRoute, { replace: true })
    }
  }, [isAuthenticated, defaultRoute, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return

    setError(false)
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, LOGIN_DELAY_MS))

    const user = authenticate(username.trim(), password)
    if (user) {
      login(user)
      setLang(readUserPreferences(user.username).language)
      navigate(getPostLoginPath(user), { replace: true })
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="login-page cmsa-background">
      <CmsaBackgroundDecor />
      <div className="login-page__lang">
        <LangSwitcher />
      </div>

      <div className="login-page__inner">
        <header className="login-page__heading">
          <h1 className="login-page__title">{copy.title}</h1>
          <p className="login-page__subtitle">{copy.subtitle}</p>
        </header>

        <div className="login-card">
          <form className="login-card__form" onSubmit={handleSubmit} noValidate>
            <div className="login-card__field">
              <label className="login-card__label" htmlFor="username">
                {copy.username}
              </label>
              <div className="login-card__input-wrap">
                <UserIcon />
                <input
                  id="username"
                  className={`login-card__input${error ? ' login-card__input--error' : ''}`}
                  type="text"
                  autoComplete="username"
                  placeholder={copy.usernamePlaceholder}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError(false)
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-card__field">
              <label className="login-card__label" htmlFor="password">
                {copy.password}
              </label>
              <div className="login-card__input-wrap">
                <LockIcon />
                <input
                  id="password"
                  className={`login-card__input login-card__input--password${error ? ' login-card__input--error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={copy.passwordPlaceholder}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(false)
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-card__password-toggle"
                  aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-card__error" role="alert">
                {copy.error}
              </p>
            )}

            <button type="submit" className="login-card__submit" disabled={loading}>
              {loading ? copy.loading : copy.submit}
            </button>
          </form>

          <div className="login-card__help">
            <button
              type="button"
              className="login-card__help-btn"
              onClick={() => setShowHelp((v) => !v)}
            >
              {showHelp ? copy.helpHide : copy.helpToggle}
            </button>

            {showHelp && (
              <div className="login-card__help-panel">
                <p className="login-card__help-title">{copy.helpTitle}</p>
                <ul className="login-card__help-list">
                  {getVisibleMockCredentials().map((cred) => (
                    <li key={cred.username}>
                      {cred.roleLabel ?? cred.user.role}
                      {' · '}
                      <code>{cred.username}</code> / <code>{cred.password}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <p className="login-page__footer">{t.common.wireframeFooter}</p>
      </div>
    </div>
  )
}
