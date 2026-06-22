import { useLanguage } from '../../i18n/LanguageContext'
import type { Lang } from '../../i18n/translations'

interface LangSwitcherProps {
  className?: string
}

export function LangSwitcher({ className = '' }: LangSwitcherProps) {
  const { lang, setLang } = useLanguage()

  function handleChange(next: Lang) {
    setLang(next)
  }

  return (
    <div
      className={`lang-switcher${className ? ` ${className}` : ''}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={`lang-switcher__btn${lang === 'es' ? ' lang-switcher__btn--active' : ''}`}
        onClick={() => handleChange('es')}
        aria-pressed={lang === 'es'}
      >
        ES
      </button>
      <button
        type="button"
        className={`lang-switcher__btn${lang === 'en' ? ' lang-switcher__btn--active' : ''}`}
        onClick={() => handleChange('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  )
}
