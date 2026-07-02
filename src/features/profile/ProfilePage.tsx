import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { useTheme } from '../../theme/ThemeContext'
import type { User } from '../../types/auth'
import {
  MOCK_AVATAR_IDS,
  patchUserPreferences,
  readUserPreferences,
  type UserPreferences,
} from '../../utils/userPreferences'
import { ProfileAvatar } from './components/ProfileAvatar'
import './profile.css'

function getCompanyChipClass(user: User): string {
  if (user.company === 'GLOBAL') return 'profile-page__chip profile-page__chip--global'
  return `profile-page__chip profile-page__chip--${user.company.toLowerCase()}`
}

export function ProfilePage() {
  const { user } = useAuth()
  const location = useLocation()
  const { t, lang, setLang } = useLanguage()
  const { theme, setTheme } = useTheme()
  const p = t.profile

  const [prefs, setPrefs] = useState<UserPreferences>(() =>
    readUserPreferences(user?.username ?? ''),
  )
  const [email, setEmail] = useState(prefs.email)
  const [phone, setPhone] = useState(prefs.phone)
  const [jobTitle, setJobTitle] = useState(prefs.jobTitle)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const stored = readUserPreferences(user.username)
    setPrefs(stored)
    setEmail(stored.email)
    setPhone(stored.phone)
    setJobTitle(stored.jobTitle)
  }, [user])

  useEffect(() => {
    if (location.hash !== '#preferences') return
    window.requestAnimationFrame(() => {
      document.getElementById('profile-preferences')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash])

  if (!user) return null

  const currentUser = user

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 3200)
  }

  function persistPatch(patch: Partial<UserPreferences>) {
    const next = patchUserPreferences(currentUser.username, patch)
    setPrefs(next)
    return next
  }

  function handleAvatarChange(avatar: string) {
    persistPatch({ avatar })
    showToast(p.avatarSaved)
  }

  function handleLanguageChange(next: 'es' | 'en') {
    setLang(next)
    persistPatch({ language: next })
    showToast(p.preferencesSaved)
  }

  function handleThemeChange(next: 'light' | 'dark') {
    setTheme(next)
    persistPatch({ theme: next })
    showToast(p.preferencesSaved)
  }

  function handleSaveContact() {
    persistPatch({
      email: email.trim() || prefs.email,
      phone: phone.trim(),
      jobTitle: jobTitle.trim(),
    })
    showToast(p.contactSaved)
  }

  function handleSavePassword(e: FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(p.passwordIncomplete)
      return
    }
    if (newPassword !== confirmPassword) {
      showToast(p.passwordMismatch)
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    showToast(p.passwordSaved)
  }

  return (
    <div className="profile-page">
      <PageHeader
        title={p.title}
        description={p.subtitle}
        showMockBadge
        badgeLabel={p.phaseBadge}
      />

      {toast && (
        <p className="profile-page__toast" role="status">
          {toast}
        </p>
      )}

      <div className="profile-page__grid">
        <aside className="profile-page__identity">
          <article className="profile-page__card profile-page__card--identity">
            <div className="profile-page__avatar-wrap">
              <ProfileAvatar avatarId={prefs.avatar} name={currentUser.name} size="xl" />
            </div>

            <h2 className="profile-page__name">{currentUser.name}</h2>
            <p className="profile-page__username">{currentUser.username}</p>

            <div className="profile-page__chips">
              <span className={getCompanyChipClass(currentUser)}>{currentUser.company}</span>
              <span className="profile-page__chip profile-page__chip--role">{t.roles[currentUser.role]}</span>
              <span className="profile-page__chip profile-page__chip--active">
                <CheckCircle2 size={12} aria-hidden="true" />
                {p.statusActive}
              </span>
            </div>

            <dl className="profile-page__identity-fields">
              <div>
                <dt>{p.role}</dt>
                <dd>{t.roles[currentUser.role]}</dd>
              </div>
              <div>
                <dt>{p.company}</dt>
                <dd>{currentUser.company}</dd>
              </div>
              <div>
                <dt>{p.status}</dt>
                <dd>{p.statusActive}</dd>
              </div>
            </dl>

            <div className="profile-page__avatar-actions">
              <button
                type="button"
                className="ui-btn ui-btn--md ui-btn--secondary profile-page__change-photo"
                onClick={() => setAvatarPickerOpen((open) => !open)}
              >
                {p.changePhoto}
              </button>

              {avatarPickerOpen && (
                <div className="profile-page__avatar-picker" role="listbox" aria-label={p.photoTitle}>
                  {MOCK_AVATAR_IDS.map((avatarId) => (
                    <button
                      key={avatarId}
                      type="button"
                      role="option"
                      aria-selected={prefs.avatar === avatarId}
                      className={`profile-page__avatar-btn${prefs.avatar === avatarId ? ' profile-page__avatar-btn--active' : ''}`}
                      onClick={() => handleAvatarChange(avatarId)}
                    >
                      <ProfileAvatar avatarId={avatarId} name={currentUser.name} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </article>
        </aside>

        <div className="profile-page__settings">
          <article id="profile-preferences" className="profile-page__card">
            <h3 className="profile-page__card-title">{p.interfacePreferences}</h3>

            <div className="profile-page__pref-block">
              <span className="profile-page__label">{p.language}</span>
              <div className="profile-page__toggle-row">
                <button
                  type="button"
                  className={`profile-page__toggle-btn${lang === 'es' ? ' profile-page__toggle-btn--active' : ''}`}
                  onClick={() => handleLanguageChange('es')}
                >
                  {p.languageEs}
                </button>
                <button
                  type="button"
                  className={`profile-page__toggle-btn${lang === 'en' ? ' profile-page__toggle-btn--active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  {p.languageEn}
                </button>
              </div>
            </div>

            <div className="profile-page__pref-block">
              <span className="profile-page__label">{t.common.themeAppearance}</span>
              <div className="profile-page__toggle-row">
                <button
                  type="button"
                  className={`profile-page__toggle-btn${theme === 'light' ? ' profile-page__toggle-btn--active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun size={16} aria-hidden="true" />
                  {t.common.themeLight}
                </button>
                <button
                  type="button"
                  className={`profile-page__toggle-btn${theme === 'dark' ? ' profile-page__toggle-btn--active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon size={16} aria-hidden="true" />
                  {t.common.themeDark}
                </button>
              </div>
            </div>
          </article>

          <article className="profile-page__card">
            <h3 className="profile-page__card-title">{p.contactData}</h3>

            <label className="profile-page__label" htmlFor="profile-email">
              {p.email}
            </label>
            <input
              id="profile-email"
              className="ui-input profile-page__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="profile-page__label" htmlFor="profile-phone">
              {p.phone}
            </label>
            <input
              id="profile-phone"
              className="ui-input profile-page__input"
              type="tel"
              value={phone}
              placeholder={p.phonePlaceholder}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label className="profile-page__label" htmlFor="profile-job-title">
              {p.jobTitle}
            </label>
            <input
              id="profile-job-title"
              className="ui-input profile-page__input"
              type="text"
              value={jobTitle}
              placeholder={p.jobTitlePlaceholder}
              onChange={(e) => setJobTitle(e.target.value)}
            />

            <div className="profile-page__card-actions">
              <button type="button" className="ui-btn ui-btn--md ui-btn--primary" onClick={handleSaveContact}>
                {p.saveContactData}
              </button>
            </div>
          </article>

          <article className="profile-page__card">
            <h3 className="profile-page__card-title">{p.securityMock}</h3>

            <form className="profile-page__password-form" onSubmit={handleSavePassword}>
              <label className="profile-page__label" htmlFor="profile-current-password">
                {p.currentPassword}
              </label>
              <input
                id="profile-current-password"
                className="ui-input profile-page__input"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <label className="profile-page__label" htmlFor="profile-new-password">
                {p.newPassword}
              </label>
              <input
                id="profile-new-password"
                className="ui-input profile-page__input"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <label className="profile-page__label" htmlFor="profile-confirm-password">
                {p.confirmPassword}
              </label>
              <input
                id="profile-confirm-password"
                className="ui-input profile-page__input"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="profile-page__card-actions">
                <button type="submit" className="ui-btn ui-btn--md ui-btn--secondary">
                  {p.savePassword}
                </button>
              </div>
            </form>
          </article>
        </div>
      </div>
    </div>
  )
}
