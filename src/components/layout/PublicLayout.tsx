import { Link, Outlet } from 'react-router-dom'
import { CmsaBackgroundDecor } from './CmsaBackgroundDecor'
import { LangSwitcher } from '../ui/LangSwitcher'
import { useLanguage } from '../../i18n/LanguageContext'
import './public-layout.css'

export function PublicLayout() {
  const { t } = useLanguage()

  return (
    <div className="public-layout cmsa-background">
      <CmsaBackgroundDecor />
      <header className="public-layout__header">
        <div className="public-layout__header-inner public-layout__header-inner--wide">
          <span className="public-layout__brand">CMSA</span>
          <div className="public-layout__actions">
            <LangSwitcher />
            <Link to="/login" className="public-layout__login ui-btn ui-btn--primary">
              {t.common.signIn}
            </Link>
          </div>
        </div>
      </header>
      <main className="public-layout__main">
        <div className="app-content app-content--wide">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
