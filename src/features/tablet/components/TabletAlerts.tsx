import { useLanguage } from '../../../i18n/LanguageContext'
import type { TabletAlert } from '../../../utils/tabletHelpers'

interface TabletAlertsProps {
  alerts: TabletAlert[]
}

export function TabletAlerts({ alerts }: TabletAlertsProps) {
  const { t } = useLanguage()
  const d = t.tablet

  return (
    <section className="tablet-panel dash-card">
      <h2 className="tablet-panel__title">{d.alertsTitle}</h2>
      <ul className="tablet-alerts-list">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className={`tablet-alert tablet-alert--${alert.severity}`}
          >
            <span className="tablet-alert__message">{alert.message}</span>
            {alert.source && (
              <span className="tablet-alert__source">{alert.source}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
