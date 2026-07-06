import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { RealSafetyAlarm, SafetyAlarmStatus } from '../../../data/mockSafetyAlarms'
import { isSupervisor } from '../../../utils/permissions'
import { alarmStatusLabel } from './operationalAlarmsHelpers'
import '../../admin/admin.css'

interface RealSafetyAlarmsTableProps {
  alarms: RealSafetyAlarm[]
  onMarkReviewed?: (alarm: RealSafetyAlarm) => void
}

function statusBadgeClass(status: SafetyAlarmStatus): string {
  if (status === 'active') return 'warn'
  if (status === 'reviewed') return 'ok'
  return 'off'
}

export function RealSafetyAlarmsTable({ alarms, onMarkReviewed }: RealSafetyAlarmsTableProps) {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.alarms
  const [detail, setDetail] = useState<RealSafetyAlarm | null>(null)

  if (alarms.length === 0) {
    return <p className="admin-empty">{d.safetyNoResults}</p>
  }

  return (
    <>
      <div className="admin-table-wrap" role="region" aria-label={d.tabSafety}>
        <table className="admin-table operational-alarms-table">
          <thead>
            <tr>
              <th>{d.safetyColTime}</th>
              <th>{d.safetyColCell}</th>
              <th>{d.safetyColType}</th>
              <th>{d.safetyColStatus}</th>
              <th>{d.safetyColMessage}</th>
              <th>{d.safetyColAction}</th>
            </tr>
          </thead>
          <tbody>
            {alarms.map((alarm) => (
              <tr key={alarm.id} className={`operational-alarms-table__row operational-alarms-table__row--${alarm.status}`}>
                <td className="admin-table__cell-mono">{alarm.time}</td>
                <td>{alarm.cellOrZone}</td>
                <td>{alarm.type}</td>
                <td>
                  <span className={`admin-badge admin-badge--${statusBadgeClass(alarm.status)}`}>
                    {alarmStatusLabel(alarm.status, lang)}
                  </span>
                </td>
                <td className="real-safety-alarms-table__message">{alarm.message}</td>
                <td className="admin-table__actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={() => setDetail(alarm)}
                  >
                    <Eye size={14} aria-hidden="true" />
                    {d.safetyViewDetail}
                  </button>
                  {alarm.status === 'active' && user && isSupervisor(user) && onMarkReviewed && (
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm"
                      onClick={() => onMarkReviewed(alarm)}
                    >
                      {d.markReviewed}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setDetail(null)}>
          <div
            className="order-modal order-modal--neutral"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="order-modal__head">
              <h2 className="order-modal__title">{d.safetyDetailTitle}</h2>
              <p className="order-modal__subtitle">{detail.type}</p>
            </header>
            <dl className="order-modal__dl">
              <div className="order-modal__row">
                <dt>{d.safetyColTime}</dt>
                <dd>{detail.time}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.safetyColCell}</dt>
                <dd>{detail.cellOrZone}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.safetyColStatus}</dt>
                <dd>{alarmStatusLabel(detail.status, lang)}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.safetyColMessage}</dt>
                <dd>{detail.message}</dd>
              </div>
            </dl>
            <div className="order-modal__actions">
              {detail.status === 'active' && user && isSupervisor(user) && onMarkReviewed && (
                <button
                  type="button"
                  className="order-btn order-btn--primary"
                  onClick={() => {
                    onMarkReviewed(detail)
                    setDetail(null)
                  }}
                >
                  {d.markReviewed}
                </button>
              )}
              <button type="button" className="order-btn order-btn--ghost" onClick={() => setDetail(null)}>
                {d.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
