import { useAuth } from '../../auth/AuthContext'
import { PageHeader } from '../../../components/ui/PageHeader'
import { useLanguage } from '../../../i18n/LanguageContext'

export function TabletHeader() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.tablet

  return (
    <header className="tablet-header">
      <PageHeader
        title={d.title}
        description={d.subtitle}
        showMockBadge
        action={
          user ? (
            <div className="tablet-header__meta">
              <span className="tablet-header__user">{user.name}</span>
              <span className="tablet-header__role">{t.roles[user.role]}</span>
              <span className={`tablet-chip tablet-chip--${user.company.toLowerCase()}`}>
                {user.company}
              </span>
            </div>
          ) : undefined
        }
      />
    </header>
  )
}
