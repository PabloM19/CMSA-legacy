import { useMemo, useState } from 'react'
import { Eye, Search } from 'lucide-react'
import { getCellAlarms } from '../../../data/mockCellAlarms'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { CellAlarm } from '../../../types/cellAlarm'
import { isOperator, isSupervisor } from '../../../utils/permissions'
import '../plant-map.css'

interface PlantMapAlertsProps {
  alarms?: CellAlarm[]
  onSelectAlarm: (alarm: CellAlarm) => void
  onMarkReviewed?: (alarm: CellAlarm) => void
}

function alarmStatusLabel(status: CellAlarm['status'], lang: 'es' | 'en'): string {
  const es = { active: 'Activa', reviewed: 'Revisada', resolved: 'Resuelta' }
  const en = { active: 'Active', reviewed: 'Reviewed', resolved: 'Resolved' }
  return (lang === 'es' ? es : en)[status]
}

function alarmSeverityLabel(
  severity: CellAlarm['severity'],
  lang: 'es' | 'en',
  d: { alarmSeverityHigh: string; alarmSeverityMedium: string },
): string {
  if (severity === 'critical') return d.alarmSeverityHigh
  if (severity === 'warning') return d.alarmSeverityMedium
  return lang === 'es' ? 'Informativa' : 'Info'
}

function matchesAlarmQuery(
  alarm: CellAlarm,
  query: string,
  lang: 'es' | 'en',
  d: { alarmSeverityHigh: string; alarmSeverityMedium: string },
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const severity = alarmSeverityLabel(alarm.severity, lang, d).toLowerCase()
  const status = alarmStatusLabel(alarm.status, lang).toLowerCase()
  const haystack = [
    alarm.orderReference,
    alarm.cellCode,
    alarm.company,
    alarm.type,
    alarm.summary,
    alarm.message,
    alarm.severity,
    severity,
    status,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export function PlantMapAlerts({ alarms: alarmsProp, onSelectAlarm, onMarkReviewed }: PlantMapAlertsProps) {
  const { user, isAuthenticated } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.plantMap
  const a = t.alarms

  const [query, setQuery] = useState('')

  const source = alarmsProp ?? getCellAlarms()
  const base = useMemo(
    () => source.filter((alarm) => alarm.status !== 'resolved'),
    [source],
  )

  const filtered = useMemo(
    () => base.filter((alarm) => matchesAlarmQuery(alarm, query, lang, d)),
    [base, query, lang, d],
  )

  return (
    <section className="plant-map-alarms-table" aria-label={d.activeAlertsTitle}>
      <div className="plant-map-alarms-table__head">
        <h2 className="plant-map-alarms-table__title">{d.activeAlertsTitle}</h2>
        <label className="plant-map-alarms-table__search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={d.alarmSearchPlaceholder}
            aria-label={d.alarmSearchPlaceholder}
          />
        </label>
      </div>

      <div className="plant-map-alarms-table__wrap">
        <table className="plant-map-alarms-table__table">
          <thead>
            <tr>
              <th scope="col">{d.alarmTableTime}</th>
              <th scope="col">{d.alarmTableObjective}</th>
              <th scope="col">{d.alarmTableCompany}</th>
              <th scope="col">{d.alarmTableCell}</th>
              <th scope="col">{d.alarmTableType}</th>
              <th scope="col">{d.alarmTableSeverity}</th>
              <th scope="col">{d.alarmTableStatus}</th>
              <th scope="col">{d.alarmTableAction}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="plant-map-alarms-table__empty">
                  {d.alarmNoResults}
                </td>
              </tr>
            ) : (
              filtered.map((alarm) => (
                <tr key={alarm.id} className={alarm.status === 'reviewed' ? 'plant-map-alarms-table__row--reviewed' : undefined}>
                  <td className="plant-map-alarms-table__cell plant-map-alarms-table__cell--time">
                    {alarm.time}
                  </td>
                  <td className="plant-map-alarms-table__cell plant-map-alarms-table__cell--mono">
                    {alarm.orderReference}
                  </td>
                  <td className="plant-map-alarms-table__cell">
                    <span className={`dash-chip dash-chip--${alarm.company.toLowerCase()}`}>
                      {alarm.company}
                    </span>
                  </td>
                  <td className="plant-map-alarms-table__cell">{alarm.cellCode}</td>
                  <td className="plant-map-alarms-table__cell">{alarm.type}</td>
                  <td className="plant-map-alarms-table__cell">
                    {alarmSeverityLabel(alarm.severity, lang, d)}
                  </td>
                  <td className="plant-map-alarms-table__cell">
                    {alarmStatusLabel(alarm.status, lang)}
                  </td>
                  <td className="plant-map-alarms-table__cell plant-map-alarms-table__cell--actions">
                    <button
                      type="button"
                      className="plant-map-alarms-table__link"
                      onClick={() => onSelectAlarm(alarm)}
                    >
                      <Eye size={14} aria-hidden="true" />
                      {a.viewDetail}
                    </button>
                    {alarm.status === 'active' && isAuthenticated && user && isSupervisor(user) && onMarkReviewed && (
                      <button
                        type="button"
                        className="plant-map-alarms-table__link plant-map-alarms-table__link--secondary"
                        onClick={() => onMarkReviewed(alarm)}
                      >
                        {a.markReviewed}
                      </button>
                    )}
                    {alarm.status === 'active' && isAuthenticated && user && isOperator(user) && (
                      <button
                        type="button"
                        className="plant-map-alarms-table__link plant-map-alarms-table__link--disabled"
                        disabled
                        title={d.markReviewedDisabledTooltip}
                      >
                        {a.markReviewed}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
