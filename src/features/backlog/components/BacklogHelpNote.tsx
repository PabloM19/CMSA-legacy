import { Info } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'

export function BacklogHelpNote() {
  const { t } = useLanguage()
  const d = t.backlog

  return (
    <aside className="backlog-help" aria-label={d.helpTitle}>
      <Info size={18} strokeWidth={1.75} aria-hidden="true" />
      <p>{d.helpText}</p>
    </aside>
  )
}
