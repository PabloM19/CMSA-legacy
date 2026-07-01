import type { Lang } from '../i18n/translations'
import type { Theme } from '../theme/themeStorage'

export interface UserPreferences {
  theme: Theme
  language: Lang
  email: string
  avatar: string
  phone: string
  jobTitle: string
}

const PREFS_PREFIX = 'cmsa-user-preferences-'
const LEGACY_THEME_PREFIX = 'cmsa-theme-'
const LEGACY_LANG_KEY = 'cmsa-lang'

export const MOCK_AVATAR_IDS = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4'] as const

const DEFAULT_EMAILS: Record<string, string> = {
  operario_sumo: 'sumo@cmsa.demo',
  operario_maf: 'maf@cmsa.demo',
  usuario_supervisor: 'supervisor@cmsa.demo',
  usuario_superadmin: 'admin@cmsa.demo',
  usuario_sumo: 'sumo@cmsa.demo',
  usuario_maf: 'maf@cmsa.demo',
  usuario_master: 'admin@cmsa.demo',
}

export function getPreferencesStorageKey(username: string): string {
  return `${PREFS_PREFIX}${username}`
}

export function getDefaultEmail(username: string): string {
  return DEFAULT_EMAILS[username] ?? `${username.replace(/^usuario_/, '')}@cmsa.demo`
}

function readLegacyTheme(username: string): Theme | null {
  const stored = localStorage.getItem(`${LEGACY_THEME_PREFIX}${username}`)
  if (stored === 'dark' || stored === 'light') return stored
  return null
}

function readLegacyLang(): Lang | null {
  const stored = localStorage.getItem(LEGACY_LANG_KEY)
  if (stored === 'en' || stored === 'es') return stored
  return null
}

export function getDefaultPreferences(username: string): UserPreferences {
  return {
    theme: 'light',
    language: 'es',
    email: getDefaultEmail(username),
    avatar: 'avatar-1',
    phone: '',
    jobTitle: '',
  }
}

export function readUserPreferences(username: string): UserPreferences {
  const defaults = getDefaultPreferences(username)
  const raw = localStorage.getItem(getPreferencesStorageKey(username))

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<UserPreferences>
      return {
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
        language: parsed.language === 'en' ? 'en' : 'es',
        email: typeof parsed.email === 'string' && parsed.email.trim() ? parsed.email : defaults.email,
        avatar:
          typeof parsed.avatar === 'string' && MOCK_AVATAR_IDS.includes(parsed.avatar as (typeof MOCK_AVATAR_IDS)[number])
            ? parsed.avatar
            : defaults.avatar,
        phone: typeof parsed.phone === 'string' ? parsed.phone : defaults.phone,
        jobTitle: typeof parsed.jobTitle === 'string' ? parsed.jobTitle : defaults.jobTitle,
      }
    } catch {
      /* fallback to migration */
    }
  }

  const legacyTheme = readLegacyTheme(username)
  const legacyLang = readLegacyLang()

  return {
    ...defaults,
    theme: legacyTheme ?? defaults.theme,
    language: legacyLang ?? defaults.language,
  }
}

export function saveUserPreferences(username: string, prefs: UserPreferences): void {
  localStorage.setItem(getPreferencesStorageKey(username), JSON.stringify(prefs))
}

export function patchUserPreferences(
  username: string,
  patch: Partial<UserPreferences>,
): UserPreferences {
  const next = { ...readUserPreferences(username), ...patch }
  saveUserPreferences(username, next)
  return next
}

export function readGuestLanguage(): Lang {
  const stored = localStorage.getItem(LEGACY_LANG_KEY)
  return stored === 'en' ? 'en' : 'es'
}

export function saveGuestLanguage(lang: Lang): void {
  localStorage.setItem(LEGACY_LANG_KEY, lang)
}
