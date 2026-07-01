import { AlertTriangle } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { CellAlarm } from '../../../types/cellAlarm'
import { isSupervisor } from '../../../utils/permissions'
import type { User } from '../../../types/auth'

interface PlantAlarmDrawerProps {
  alarm: CellAlarm | null
  user: User | null
  onClose: () => void
  onMarkReviewed: (alarm: CellAlarm) => void
}

function severityLabel(severity: CellAlarm['severity'], lang: 'es' | 'en'): string {
  const es = { info: 'Informativa', warning: 'Media', critical: 'Alta' }
  const en = { info: 'Info', warning: 'Medium', critical: 'High' }
  return (lang === 'es' ? es : en)[severity]
}

function statusLabel(status: CellAlarm['status'], lang: 'es' | 'en'): string {
  const es = { active: 'Activa', reviewed: 'Revisada', resolved: 'Resuelta' }
  const en = { active: 'Active', reviewed: 'Reviewed', resolved: 'Resolved' }
  return (lang === 'es' ? es : en)[status]
}

export function PlantAlarmDrawer({
  alarm,
  user,
  onClose,
  onMarkReviewed,
}: PlantAlarmDrawerProps) {
  const { t, lang } = useLanguage()
  const d = t.plantMap
  const a = t.alarms

  if (!alarm) return null

  const canMarkReviewed = Boolean(user && isSupervisor(user) && alarm.status === 'active')

  return (
    <div className="plant-drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="plant-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plant-alarm-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="plant-drawer__head">
          <div>
            <h2 id="plant-alarm-drawer-title" className="plant-drawer__title">
              {a.detailTitle}
            </h2>
            <p className="plant-drawer__subtitle">{alarm.type}</p>
          </div>
          <button type="button" className="plant-drawer__close" onClick={onClose} aria-label={d.close}>
            ×
          </button>
        </header>

        <div className={`plant-alarm-drawer__severity plant-alarm-drawer__severity--${alarm.severity}`}>
          <AlertTriangle size={18} aria-hidden="true" />
          <span>{severityLabel(alarm.severity, lang)}</span>
        </div>

        <dl className="plant-drawer__dl">
          <div>
            <dt>{a.orderLabel}</dt>
            <dd>{alarm.orderReference}</dd>
          </div>
          <div>
            <dt>{d.drawerCompany}</dt>
            <dd>
              <span className={`dash-chip dash-chip--${alarm.company.toLowerCase()}`}>
                {alarm.company}
              </span>
            </dd>
          </div>
          <div>
            <dt>{d.drawerProduct}</dt>
            <dd>{alarm.product}</dd>
          </div>
          <div>
            <dt>{d.drawerVariety}</dt>
            <dd>{alarm.variety}</dd>
          </div>
          <div>
            <dt>{a.cellLabel}</dt>
            <dd>{alarm.cellCode}</dd>
          </div>
          <div>
            <dt>{a.typeLabel}</dt>
            <dd>{alarm.type}</dd>
          </div>
          <div>
            <dt>{a.timeLabel}</dt>
            <dd>{alarm.time}</dd>
          </div>
          <div>
            <dt>{a.statusLabel}</dt>
            <dd>{statusLabel(alarm.status, lang)}</dd>
          </div>
        </dl>

        <section className="plant-drawer__section">
          <h3 className="plant-drawer__section-title">{d.alarmMessageTitle}</h3>
          <p className="plant-drawer__alert">
            <AlertTriangle size={16} aria-hidden="true" />
            {alarm.message}
          </p>
        </section>

        <footer className="plant-drawer__footer plant-alarm-drawer__footer">
          {canMarkReviewed && (
            <button
              type="button"
              className="plant-alarm-drawer__btn plant-alarm-drawer__btn--primary"
              onClick={() => onMarkReviewed(alarm)}
            >
              {a.markReviewed}
            </button>
          )}
          <button
            type="button"
            className="plant-alarm-drawer__btn plant-alarm-drawer__btn--disabled"
            disabled
            title={a.reassignDisabled}
          >
            {d.reassignPendingButton}
          </button>
          <button type="button" className="plant-alarm-drawer__btn" onClick={onClose}>
            {a.close}
          </button>
        </footer>
      </aside>
    </div>
  )
}
