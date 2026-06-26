import { useLanguage } from '../../../i18n/LanguageContext'
import type { TabletAlert } from '../../../utils/tabletHelpers'

interface TabletAlertsProps {
  alerts: TabletAlert[]
  onAlertTap?: (alert: TabletAlert) => void
}

function alertIcon(severity: TabletAlert['severity']): string {
  if (severity === 'critical') return '⚠'
  if (severity === 'warning') return '⏸'
  return 'ℹ'
}

export function TabletAlerts({ alerts, onAlertTap }: TabletAlertsProps) {
  const { t } = useLanguage()
  const d = t.tablet
  const actionable = alerts.filter((a) => a.id !== 'all-ok')

  return (
    <section className="tablet-panel dash-card">
      <h2 className="tablet-panel__title">{d.alertsTitle}</h2>
      {actionable.length > 0 && (
        <p className="tablet-panel__hint">{d.alertsTapHint}</p>
      )}
      <ul className="tablet-alerts-list">
        {alerts.map((alert) => {
          const tappable = alert.id !== 'all-ok' && onAlertTap
          return (
            <li key={alert.id}>
              <button
                type="button"
                className={`tablet-alert tablet-alert--${alert.severity}${tappable ? ' tablet-alert--tappable' : ''}`}
                disabled={!tappable}
                onClick={() => tappable && onAlertTap(alert)}
              >
                <span className="tablet-alert__icon">{alertIcon(alert.severity)}</span>
                <span className="tablet-alert__body">
                  <span className="tablet-alert__message">{alert.message}</span>
                  {alert.source && (
                    <span className="tablet-alert__source">{alert.source}</span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
