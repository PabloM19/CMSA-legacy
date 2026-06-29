import { useLanguage } from '../../../i18n/LanguageContext'

export function AdminEmptyState() {
  const { t } = useLanguage()
  return <p className="admin-empty">{t.admin.noResults}</p>
}
