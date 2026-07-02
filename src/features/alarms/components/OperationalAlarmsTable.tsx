import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { CellAlarm } from '../../../types/cellAlarm'
import { isOperator, isSupervisor } from '../../../utils/permissions'
import { AdminEmptyState } from '../../admin/components/AdminEmptyState'
import { AdminSearchBar } from '../../admin/components/AdminSearchBar'
import {
  alarmSeverityLabel,
  alarmStatusLabel,
  filterAlarmsByStatus,
  matchesAlarmQuery,
  type AlarmFilter,
} from './operationalAlarmsHelpers'
import '../alarms.css'
import '../../admin/admin.css'

interface OperationalAlarmsTableProps {
  alarms: CellAlarm[]
  /** Si se define, "Ver detalle" delega al padre (p. ej. drawer del mapa). */
  onViewDetail?: (alarm: CellAlarm) => void
  onMarkReviewed?: (alarm: CellAlarm) => void
  /** Ocultar alarmas resueltas (default true). */
  hideResolved?: boolean
  /** Título de sección opcional encima del buscador. */
  sectionTitle?: string
}

export function OperationalAlarmsTable({
  alarms,
  onViewDetail,
  onMarkReviewed,
  hideResolved = true,
  sectionTitle,
}: OperationalAlarmsTableProps) {
  const { user, isAuthenticated } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.alarms
  const pm = t.plantMap

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<AlarmFilter>('all')
  const [detail, setDetail] = useState<CellAlarm | null>(null)

  const severityLabels = useMemo(
    () => ({ high: pm.alarmSeverityHigh, medium: pm.alarmSeverityMedium }),
    [pm.alarmSeverityHigh, pm.alarmSeverityMedium],
  )

  const base = useMemo(
    () => (hideResolved ? alarms.filter((a) => a.status !== 'resolved') : alarms),
    [alarms, hideResolved],
  )

  const filtered = useMemo(() => {
    const byStatus = filterAlarmsByStatus(base, filter)
    return byStatus.filter((alarm) => matchesAlarmQuery(alarm, query, lang, severityLabels))
  }, [base, filter, query, lang, severityLabels])

  function handleViewDetail(alarm: CellAlarm) {
    if (onViewDetail) {
      onViewDetail(alarm)
      return
    }
    setDetail(alarm)
  }

  const filterOptions: { id: AlarmFilter; label: string }[] = [
    { id: 'all', label: d.filterAll },
    { id: 'active', label: d.filterActive },
    { id: 'reviewed', label: d.filterReviewed },
  ]

  return (
    <>
      {sectionTitle && <h2 className="operational-alarms__section-title">{sectionTitle}</h2>}

      <AdminSearchBar
        value={query}
        onChange={setQuery}
        placeholder={d.searchPlaceholder}
        resultCount={filtered.length}
      />

      <div className="admin-filter-bar operational-alarms__filters">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`admin-filter-bar__btn${filter === opt.id ? ' admin-filter-bar__btn--active' : ''}`}
            onClick={() => setFilter(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState message={d.noResults} />
      ) : (
        <div className="admin-table-wrap" role="region" aria-label={d.title}>
          <table className="admin-table operational-alarms-table">
            <thead>
              <tr>
                <th>{pm.alarmTableTime}</th>
                <th>{pm.alarmTableObjective}</th>
                <th>{pm.alarmTableCompany}</th>
                <th>{pm.alarmTableCell}</th>
                <th>{pm.alarmTableType}</th>
                <th>{pm.alarmTableSeverity}</th>
                <th>{pm.alarmTableStatus}</th>
                <th>{pm.alarmTableAction}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alarm) => (
                <tr
                  key={alarm.id}
                  className={`operational-alarms-table__row operational-alarms-table__row--${alarm.severity}${
                    alarm.status === 'reviewed' ? ' operational-alarms-table__row--reviewed' : ''
                  }`}
                >
                  <td className="admin-table__cell-mono">{alarm.time}</td>
                  <td className="admin-table__cell-ref">{alarm.orderReference}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${alarm.company.toLowerCase()}`}>
                      {alarm.company}
                    </span>
                  </td>
                  <td>{alarm.cellCode}</td>
                  <td>{alarm.type}</td>
                  <td>
                    <span
                      className={`admin-badge admin-badge--${
                        alarm.severity === 'critical'
                          ? 'danger'
                          : alarm.severity === 'warning'
                            ? 'warn'
                            : 'info'
                      }`}
                    >
                      {alarmSeverityLabel(alarm.severity, lang, severityLabels)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge admin-badge--${
                        alarm.status === 'active' ? 'warn' : alarm.status === 'reviewed' ? 'ok' : 'off'
                      }`}
                    >
                      {alarmStatusLabel(alarm.status, lang)}
                    </span>
                  </td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => handleViewDetail(alarm)}
                    >
                      <Eye size={14} aria-hidden="true" />
                      {d.viewDetail}
                    </button>
                    {alarm.status === 'active' && isAuthenticated && user && isSupervisor(user) && onMarkReviewed && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm"
                        onClick={() => onMarkReviewed(alarm)}
                      >
                        {d.markReviewed}
                      </button>
                    )}
                    {alarm.status === 'active' && isAuthenticated && user && isOperator(user) && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        disabled
                        title={pm.markReviewedDisabledTooltip}
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
      )}

      {detail && !onViewDetail && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setDetail(null)}>
          <div
            className="order-modal order-modal--neutral"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="order-modal__head">
              <h2 className="order-modal__title">{d.detailTitle}</h2>
              <p className="order-modal__subtitle">{detail.type}</p>
            </header>
            <dl className="order-modal__dl">
              <div className="order-modal__row">
                <dt>{d.orderLabel}</dt>
                <dd>{detail.orderReference}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.companyLabel}</dt>
                <dd>{detail.company}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.cellLabel}</dt>
                <dd>{detail.cellCode}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.typeLabel}</dt>
                <dd>{detail.type}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.severityLabel}</dt>
                <dd>{alarmSeverityLabel(detail.severity, lang, severityLabels)}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.timeLabel}</dt>
                <dd>{detail.time}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.statusLabel}</dt>
                <dd>{alarmStatusLabel(detail.status, lang)}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.summaryLabel}</dt>
                <dd>{detail.summary}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.messageLabel}</dt>
                <dd>{detail.message}</dd>
              </div>
            </dl>
            <p className="operational-alarms__reassign-note">{d.reassignDisabled}</p>
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
