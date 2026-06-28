import { ArrowLeft, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import { canPerformValidation } from '../../../utils/permissions'
import {
  canStartProduction,
  getTableStats,
  hasTableConflicts,
} from '../../../utils/validationHelpers'
import type { User } from '../../../types/auth'

interface ValidationActionBarProps {
  order: BacklogOrder
  user: User
  onValidateAll: () => void
  onStartProduction: () => void
}

export function ValidationActionBar({
  order,
  user,
  onValidateAll,
  onStartProduction,
}: ValidationActionBarProps) {
  const { t } = useLanguage()
  const d = t.validation
  const canAct = canPerformValidation(user)
  const stats = getTableStats(order)
  const ready = canStartProduction(order)
  const conflict = hasTableConflicts(order)

  let microcopy = ''
  if (conflict) {
    microcopy = d.startBlockedConflict
  } else if (!ready && stats.pending > 0) {
    microcopy = d.startBlockedPending.replace('{count}', String(stats.pending))
  }

  return (
    <footer className="validation-action-bar dash-card">
      {!canAct && (
        <p className="validation-action-bar__readonly">{d.readOnlyNotice}</p>
      )}

      <div className="validation-action-bar__main">
        <div className="validation-action-bar__primary">
          <button
            type="button"
            className="validation-btn validation-btn--primary validation-btn--large"
            disabled={!canAct || !ready}
            onClick={onStartProduction}
          >
            {d.startProduction}
          </button>
          {microcopy && <p className="validation-action-bar__hint">{microcopy}</p>}
        </div>

        <div className="validation-action-bar__secondary">
          {canAct && stats.pending > 0 && (
            <button type="button" className="validation-btn validation-btn--large" onClick={onValidateAll}>
              <CheckCheck size={18} aria-hidden="true" />
              {d.validateAll}
            </button>
          )}
          <Link to="/backlog" className="validation-btn validation-btn--link validation-btn--large">
            <ArrowLeft size={18} aria-hidden="true" />
            {d.backToBacklog}
          </Link>
        </div>
      </div>
    </footer>
  )
}
