import { useLanguage } from '../../../i18n/LanguageContext'

interface AdminEmptyStateProps {
  message?: string
}

export function AdminEmptyState({ message }: AdminEmptyStateProps = {}) {
  const { t } = useLanguage()
  return <p className="admin-empty">{message ?? t.admin.noResults}</p>
}
