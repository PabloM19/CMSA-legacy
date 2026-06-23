import { AlertTriangle, Info } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DashboardAlert } from '../../../types/dashboard'

interface AlertsPanelProps {
  alerts: DashboardAlert[]
}

function AlertIcon({ severity }: { severity: DashboardAlert['severity'] }) {
  if (severity === 'info') return <Info size={15} aria-hidden="true" />
  return <AlertTriangle size={15} aria-hidden="true" />
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const { t } = useLanguage()
  const d = t.dashboard

  return (
    <section className="dash-card dash-alerts">
      <h2 className="dash-section-title">{d.alertsPanel}</h2>
      <ul className="dash-alerts__list">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className={`dash-alerts__item dash-alerts__item--${alert.severity}`}
          >
            <span className="dash-alerts__icon">
              <AlertIcon severity={alert.severity} />
            </span>
            <div className="dash-alerts__body">
              <p className="dash-alerts__msg">{alert.message}</p>
              <time className="dash-alerts__time">{alert.time}</time>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
