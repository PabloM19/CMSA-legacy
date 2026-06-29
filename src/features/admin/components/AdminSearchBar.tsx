import { Search, X } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'

interface AdminSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  resultCount: number
}

export function AdminSearchBar({ value, onChange, placeholder, resultCount }: AdminSearchBarProps) {
  const { t } = useLanguage()
  const d = t.admin

  return (
    <div className="admin-search">
      <div className="admin-search__field">
        <Search size={18} className="admin-search__icon" aria-hidden="true" />
        <input
          type="search"
          className="admin-search__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {value && (
          <button
            type="button"
            className="admin-search__clear"
            onClick={() => onChange('')}
            aria-label={d.clearSearch}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="admin-search__count">
        {d.resultsCount.replace('{count}', String(resultCount))}
      </p>
    </div>
  )
}
