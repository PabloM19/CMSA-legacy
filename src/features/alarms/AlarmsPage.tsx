import { useState } from 'react'
import { AlertTriangle, Eye } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { getCellAlarms, markAlarmReviewed } from '../../data/mockCellAlarms'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { CellAlarm } from '../../types/cellAlarm'
import { isSupervisor } from '../../utils/permissions'
import './alarms.css'

function statusLabel(status: CellAlarm['status'], lang: 'es' | 'en'): string {
  const es = { active: 'Activa', reviewed: 'Revisada', resolved: 'Resuelta' }
  const en = { active: 'Active', reviewed: 'Reviewed', resolved: 'Resolved' }
  return (lang === 'es' ? es : en)[status]
}

function severityLabel(severity: CellAlarm['severity'], lang: 'es' | 'en'): string {
  const es = { info: 'Informativa', warning: 'Media', critical: 'Alta' }
  const en = { info: 'Info', warning: 'Medium', critical: 'High' }
  return (lang === 'es' ? es : en)[severity]
}

export function AlarmsPage() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.alarms

  const [alarms, setAlarms] = useState<CellAlarm[]>(() => getCellAlarms())
  const [detailId, setDetailId] = useState<string | null>(null)

  const detail = alarms.find((a) => a.id === detailId) ?? null

  function handleMarkReviewed(alarm: CellAlarm) {
    if (!user || !isSupervisor(user)) return
    setAlarms(markAlarmReviewed(alarm.id))
  }

  return (
    <div className="alarms-page">
      <PageHeader title={d.title} description={d.subtitle} showMockBadge badgeLabel={d.mockBadge} />

      <ul className="alarms-page__list">
        {alarms.map((alarm) => (
          <li
            key={alarm.id}
            className={`alarms-page__item alarms-page__item--${alarm.severity} alarms-page__item--${alarm.status}`}
          >
            <span className="alarms-page__icon" aria-hidden="true">
              <AlertTriangle size={20} strokeWidth={1.75} />
            </span>
            <div className="alarms-page__body">
              <p className="alarms-page__message">
                {alarm.type} · {alarm.summary}
              </p>
              <p className="alarms-page__meta">
                {alarm.cellCode} · {alarm.company} · {d.orderLabel}: {alarm.orderReference} ·{' '}
                {alarm.time} · {statusLabel(alarm.status, lang)}
              </p>
            </div>
            <div className="alarms-page__actions">
              <button
                type="button"
                className="alarms-page__btn"
                onClick={() => setDetailId(alarm.id)}
              >
                <Eye size={16} aria-hidden="true" />
                {d.viewDetail}
              </button>
              {alarm.status === 'active' && user && isSupervisor(user) && (
                <button
                  type="button"
                  className="alarms-page__btn alarms-page__btn--primary"
                  onClick={() => handleMarkReviewed(alarm)}
                >
                  {d.markReviewed}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {detail && (
        <aside className="alarms-page__detail dash-card">
          <h2 className="alarms-page__detail-title">{d.detailTitle}</h2>
          <dl className="alarms-page__detail-list">
            <div>
              <dt>{d.orderLabel}</dt>
              <dd>{detail.orderReference}</dd>
            </div>
            <div>
              <dt>{d.companyLabel}</dt>
              <dd>{detail.company}</dd>
            </div>
            <div>
              <dt>{d.cellLabel}</dt>
              <dd>{detail.cellCode}</dd>
            </div>
            <div>
              <dt>{d.typeLabel}</dt>
              <dd>{detail.type}</dd>
            </div>
            <div>
              <dt>{d.severityLabel}</dt>
              <dd>{severityLabel(detail.severity, lang)}</dd>
            </div>
            <div>
              <dt>{d.timeLabel}</dt>
              <dd>{detail.time}</dd>
            </div>
            <div>
              <dt>{d.statusLabel}</dt>
              <dd>{statusLabel(detail.status, lang)}</dd>
            </div>
            <div>
              <dt>{d.summaryLabel}</dt>
              <dd>{detail.summary}</dd>
            </div>
            <div>
              <dt>{d.messageLabel}</dt>
              <dd>{detail.message}</dd>
            </div>
          </dl>
          <p className="alarms-page__reassign-disabled">{d.reassignDisabled}</p>
          <button type="button" className="alarms-page__btn" onClick={() => setDetailId(null)}>
            {d.close}
          </button>
        </aside>
      )}

      <p className="alarms-page__v2">{d.reassignmentPendingNote}</p>
    </div>
  )
}
