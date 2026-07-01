import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView } from '../../../types/plant'
import {
  canMarkTabletIncident,
  canPerformTabletCriticalActions,
} from '../../../utils/permissions'

export type TabletConfirmAction = 'incident' | 'stop' | 'resume'

interface TabletDrawerActionsProps {
  element: PlantElementView
  onAction: (action: TabletConfirmAction) => void
}

export function TabletDrawerActions({ element, onAction }: TabletDrawerActionsProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.tablet

  if (!user) return null

  const canIncident = canMarkTabletIncident(user)
  const canCritical = canPerformTabletCriticalActions(user)
  const isStopped = element.status === 'blocked' || element.status === 'conflict'

  return (
    <div className="tablet-drawer-actions">
      <button
        type="button"
        className="tablet-action tablet-action--warn"
        disabled={!canIncident}
        onClick={() => onAction('incident')}
      >
        {d.actionIncident}
      </button>
      {!isStopped ? (
        <button
          type="button"
          className="tablet-action tablet-action--danger"
          disabled={!canCritical}
          onClick={() => onAction('stop')}
        >
          {d.actionStop}
        </button>
      ) : (
        <button
          type="button"
          className="tablet-action tablet-action--primary"
          disabled={!canCritical}
          onClick={() => onAction('resume')}
        >
          {d.actionResume}
        </button>
      )}
      {((user.role === 'user') || (false && !canCritical)) && (
        <p className="tablet-drawer-actions__hint">{d.actionRestricted}</p>
      )}
    </div>
  )
}
