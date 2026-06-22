import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getDateLocale, getTranslations, type Lang, type Translations } from './translations'

const LANG_STORAGE_KEY = 'cmsa-lang'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
  dateLocale: string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLang(): Lang {
  const stored = localStorage.getItem(LANG_STORAGE_KEY)
  return stored === 'en' ? 'en' : 'es'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(LANG_STORAGE_KEY, next)
  }, [])

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

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider')
  }
  return context
}
