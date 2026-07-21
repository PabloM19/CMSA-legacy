import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CmsaBackgroundDecor } from '../../components/layout/CmsaBackgroundDecor'
import { LangSwitcher } from '../../components/ui/LangSwitcher'
import { getVisibleMockCredentials } from '../../data/mockUsers'
import { useLanguage } from '../../i18n/LanguageContext'
import type { User } from '../../types/auth'
import {
  completePasswordSetup,
  getPostLoginPath,
} from '../../utils/auth'
import { attemptLogin } from '../../utils/loginAttemptFlow'
import { isUserLoginLocked, resetLoginAttempts } from '../../utils/loginAttemptsStorage'
import { readUserPreferences } from '../../utils/userPreferences'
import { useAuth } from './AuthContext'
import './login.css'

const LOGIN_DELAY_MS = 600

type LoginAlertType = 'user' | 'password' | 'locked'

interface LoginAlert {
  type: LoginAlertType
  message: string
}

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

function finishLogin(
  user: User,
  login: (user: User) => void,
  setLang: (lang: 'es' | 'en') => void,
  navigate: ReturnType<typeof useNavigate>,
) {
  login(user)
  setLang(readUserPreferences(user.username).language)
  navigate(getPostLoginPath(user), { replace: true })
}

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, login, defaultRoute } = useAuth()
  const { t, setLang } = useLanguage()
  const copy = t.login

  const sessionNotice = searchParams.get('expired')
    ? copy.expiredMessage
    : searchParams.get('inactive')
      ? copy.inactiveMessage
      : null

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [alertError, setAlertError] = useState<LoginAlert | null>(null)
  const [loading, setLoading] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const trimmedUsername = username.trim()
  const isLockedUser = trimmedUsername !== '' && isUserLoginLocked(trimmedUsername)

  const [setupUser, setSetupUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [setupError, setSetupError] = useState<string | null>(null)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(defaultRoute, { replace: true })
    }
  }, [isAuthenticated, defaultRoute, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return

    setUsernameError(null)
    setPasswordError(null)
    setAlertError(null)
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, LOGIN_DELAY_MS))

    const result = attemptLogin(username, password)

    if (result.type === 'success') {
      finishLogin(result.login.user, login, setLang, navigate)
      return
    }

    if (result.type === 'password_setup_required') {
      setSetupUser(result.login.user)
      setNewPassword('')
      setConfirmPassword('')
      setSetupError(null)
      setLoading(false)
      return
    }

    if (result.error === 'user_not_found') {
      setUsernameError(copy.errorUserNotFound)
      setAlertError({ type: 'user', message: copy.errorUserNotFound })
      setLoading(false)
      return
    }

    if (result.error === 'locked') {
      const message = copy.errorLocked
      setPasswordError(message)
      setAlertError({ type: 'locked', message })
      setLoading(false)
      return
    }

    if (result.error === 'wrong_password' && result.attempts) {
      const message = copy.errorWrongPasswordAttempts.replace(
        '{remaining}',
        String(result.attempts.remainingAttempts),
      )
      setPasswordError(copy.errorWrongPassword)
      setAlertError({ type: 'password', message })
      setLoading(false)
      return
    }

    setPasswordError(copy.errorWrongPassword)
    setAlertError({ type: 'password', message: copy.errorWrongPassword })
    setLoading(false)
  }

  async function handleSetupSubmit(e: FormEvent) {
    e.preventDefault()
    if (!setupUser || loading) return

    setSetupError(null)
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, LOGIN_DELAY_MS))

    const result = completePasswordSetup(setupUser.username, newPassword, confirmPassword)
    if (!result.ok) {
      if (result.error === 'missing_fields') {
        setSetupError(copy.setupIncomplete)
      } else if (result.error === 'mismatch') {
        setSetupError(copy.setupMismatch)
      } else {
        setSetupError(copy.error)
      }
      setLoading(false)
      return
    }

    finishLogin(result.user, login, setLang, navigate)
    resetLoginAttempts(setupUser.username)
  }

  function handleBackToLogin() {
    setSetupUser(null)
    setNewPassword('')
    setConfirmPassword('')
    setSetupError(null)
    setPassword('')
    setUsernameError(null)
    setPasswordError(null)
    setAlertError(null)
  }

  function handleUsernameChange(value: string) {
    setUsername(value)
    setUsernameError(null)

    const nextTrimmed = value.trim()
    if (nextTrimmed && isUserLoginLocked(nextTrimmed)) {
      setAlertError({ type: 'locked', message: copy.errorLocked })
    } else {
      setAlertError((current) => (current?.type === 'locked' ? null : current))
      setPasswordError((current) =>
        current === copy.errorLocked ? null : current,
      )
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    setPasswordError(null)
    setAlertError((current) => (current?.type === 'password' ? null : current))
  }

  return (
    <div className="login-page cmsa-background">
      <CmsaBackgroundDecor />
      <div className="login-page__lang">
        <LangSwitcher />
      </div>

      <div className="login-page__inner">
        <header className="login-page__heading">
          <h1 className="login-page__title">
            {setupUser ? copy.setupTitle : copy.title}
          </h1>
          <p className="login-page__subtitle">
            {setupUser
              ? copy.setupSubtitle.replace('{username}', setupUser.username)
              : copy.subtitle}
          </p>
        </header>

        <div className="login-card">
          {sessionNotice && (
            <p className="login-card__notice" role="status">
              {sessionNotice}
            </p>
          )}
          {setupUser ? (
            <form className="login-card__form" onSubmit={handleSetupSubmit} noValidate>
              <div className="login-card__field">
                <label className="login-card__label" htmlFor="new-password">
                  {copy.setupNewPassword}
                </label>
                <div className="login-card__input-wrap">
                  <LockIcon />
                  <input
                    id="new-password"
                    className={`login-card__input login-card__input--password${setupError ? ' login-card__input--error' : ''}`}
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={copy.setupNewPasswordPlaceholder}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setSetupError(null)
                    }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="login-card__password-toggle"
                    aria-label={showNewPassword ? copy.hidePassword : copy.showPassword}
                    onClick={() => setShowNewPassword((v) => !v)}
                    disabled={loading}
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="login-card__field">
                <label className="login-card__label" htmlFor="confirm-password">
                  {copy.setupConfirmPassword}
                </label>
                <div className="login-card__input-wrap">
                  <LockIcon />
                  <input
                    id="confirm-password"
                    className={`login-card__input login-card__input--password${setupError ? ' login-card__input--error' : ''}`}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={copy.setupConfirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setSetupError(null)
                    }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="login-card__password-toggle"
                    aria-label={showConfirmPassword ? copy.hidePassword : copy.showPassword}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {setupError && (
                <p className="login-card__error" role="alert">
                  {setupError}
                </p>
              )}

              <button type="submit" className="login-card__submit" disabled={loading}>
                {loading ? copy.setupLoading : copy.setupSubmit}
              </button>

              <button
                type="button"
                className="login-card__help-btn login-card__back-btn"
                onClick={handleBackToLogin}
                disabled={loading}
              >
                {copy.setupBack}
              </button>
            </form>
          ) : (
            <form className="login-card__form" onSubmit={handleSubmit} noValidate>
              {alertError && (
                <div className="login-card__alert login-card__alert--error" role="alert">
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{alertError.message}</span>
                </div>
              )}

              <div className="login-card__field">
                <label className="login-card__label" htmlFor="username">
                  {copy.username}
                </label>
                <div className="login-card__input-wrap">
                  <UserIcon />
                  <input
                    id="username"
                    className={`login-card__input${usernameError ? ' login-card__input--error' : ''}`}
                    type="text"
                    autoComplete="username"
                    placeholder={copy.usernamePlaceholder}
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    disabled={loading}
                    aria-invalid={usernameError ? true : undefined}
                    aria-describedby={usernameError ? 'username-error' : undefined}
                  />
                </div>
                {usernameError && (
                  <p id="username-error" className="login-card__field-error" role="alert">
                    {usernameError}
                  </p>
                )}
              </div>

              <div className="login-card__field">
                <label className="login-card__label" htmlFor="password">
                  {copy.password}
                </label>
                <div className="login-card__input-wrap">
                  <LockIcon />
                  <input
                    id="password"
                    className={`login-card__input login-card__input--password${passwordError ? ' login-card__input--error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={copy.passwordPlaceholder}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    disabled={loading}
                    aria-invalid={passwordError ? true : undefined}
                    aria-describedby={passwordError ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="login-card__password-toggle"
                    aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p id="password-error" className="login-card__field-error" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="login-card__submit"
                disabled={loading || isLockedUser}
              >
                {loading ? copy.loading : copy.submit}
              </button>
            </form>
          )}

          {!setupUser && (
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
          )}
        </div>

        <p className="login-page__footer">{t.common.wireframeFooter}</p>
      </div>
    </div>
  )
}
