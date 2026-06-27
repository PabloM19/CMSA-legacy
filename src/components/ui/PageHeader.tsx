import type { ReactNode } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  showMockBadge?: boolean
  badgeLabel?: string
  extra?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  action,
  showMockBadge = false,
  badgeLabel,
  extra,
  className = '',
}: PageHeaderProps) {
  const { t } = useLanguage()

  return (
    <header className={`ui-page-header ${className}`.trim()}>
      <div className="ui-page-header__row">
        <div className="ui-page-header__titles">
          <h1 className="ui-page-header__title">{title}</h1>
          {description && <p className="ui-page-header__desc">{description}</p>}
        </div>
        {(showMockBadge || action) && (
          <div className="ui-page-header__aside">
            {showMockBadge && (
              <span className="ui-mock-badge">{badgeLabel ?? t.common.mockBadge}</span>
            )}
            {action}
          </div>
        )}
      </div>
      {extra && <div className="ui-page-header__extra">{extra}</div>}
    </header>
  )
}
