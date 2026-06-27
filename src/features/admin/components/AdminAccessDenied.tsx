import { Link } from 'react-router-dom'
import { useLanguage } from '../../../i18n/LanguageContext'

export function AdminAccessDenied() {
  const { t } = useLanguage()

  return (
    <div className="admin-denied dash-card">
      <h1 className="admin-denied__title">{t.admin.accessDeniedTitle}</h1>
      <p className="admin-denied__text">{t.admin.accessDeniedMessage}</p>
      <p style={{ marginTop: 'var(--space-lg)' }}>
        <Link to="/dashboard" className="admin-btn admin-btn--primary">
          {t.admin.backToDashboard}
        </Link>
      </p>
    </div>
  )
}
