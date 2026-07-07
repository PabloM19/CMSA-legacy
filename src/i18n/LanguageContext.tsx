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
import { getDateLocale, getTranslations, type Lang, type Translations } from './translations'
import { readGuestLanguage, readUserPreferences, saveGuestLanguage, patchUserPreferences } from '../utils/userPreferences'
import { getValidSession } from '../utils/auth'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
  dateLocale: string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function resolveInitialLang(): Lang {
  const session = getValidSession()
  if (session?.user) {
    return readUserPreferences(session.user.username).language
  }
  return readGuestLanguage()
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const username = user?.username
  const [lang, setLangState] = useState<Lang>(resolveInitialLang)

  useEffect(() => {
    if (username) {
      setLangState(readUserPreferences(username).language)
    }
  }, [username])

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next)
      if (username) {
        patchUserPreferences(username, { language: next })
      } else {
        saveGuestLanguage(next)
      }
    },
    [username],
  )

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: getTranslations(lang),
      dateLocale: getDateLocale(lang),
    }),
    [lang, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider')
  }
  return context
}
