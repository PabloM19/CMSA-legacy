import { useMemo, useState } from 'react'
import { Eye, ScrollText } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AuditEvent } from '../../../types/admin'
import { getActivityLog, formatActivityTimestamp } from '../../../utils/activityLog'
import {
  filterActivityLog,
  getEntityLabel,
  type ActivityCategoryFilter,
} from '../../../utils/activityLogHelpers'
import { AdminDetailModal } from './AdminDetailModal'
import { AdminSearchBar } from './AdminSearchBar'

interface ActivityTabProps {
  refreshKey: number
}

const FILTERS: ActivityCategoryFilter[] = [
  'all',
  'users',
  'production',
  'references',
  'events',
  'system',
]

export function ActivityTab({ refreshKey }: ActivityTabProps) {
  const { t, lang } = useLanguage()
  const d = t.admin

  void refreshKey

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ActivityCategoryFilter>('all')
  const [detail, setDetail] = useState<AuditEvent | null>(null)

  const events = useMemo(() => {
    const all = getActivityLog()
    return filterActivityLog(all, search, filter)
  }, [search, filter, refreshKey])

  const filterLabels: Record<ActivityCategoryFilter, string> = {
    all: d.filterActivityAll,
    users: d.filterActivityUsers,
    production: d.filterActivityProduction,
    references: d.filterActivityReferences,
    events: d.filterActivityEvents,
    system: d.filterActivitySystem,
  }

  return (
    <section className="admin-activity-panel">
      <div className="admin-section__intro">
        <div className="admin-section__icon" aria-hidden="true">
          <ScrollText size={32} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="admin-section__title">{d.tabs.activity}</h2>
          <p className="admin-section__desc">{d.sectionActivityDesc}</p>
        </div>
      </div>

      <div className="admin-tab__toolbar">
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder={d.searchActivity}
          resultCount={events.length}
        />
      </div>

      <div className="admin-filter-bar" role="tablist" aria-label={d.tabs.activity}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`admin-filter-bar__btn${filter === f ? ' admin-filter-bar__btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap" role="region" aria-label={d.tabs.activity}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{d.activityColTime}</th>
              <th>{d.activityColUser}</th>
              <th>{d.activityColRole}</th>
              <th>{d.activityColAction}</th>
              <th>{d.activityColEntity}</th>
              <th>{d.activityColDetail}</th>
              <th>{d.colAction}</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr className="admin-activity-panel__empty-row">
                <td colSpan={7}>{d.activityNoResults}</td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id}>
                  <td className="admin-table__cell-mono">
                    {formatActivityTimestamp(event.timestamp, lang)}
                  </td>
                  <td>{event.username}</td>
                  <td>
                    <span className="admin-activity-panel__role-chip">
                      {t.roles[event.role as keyof typeof t.roles] ?? event.role}
                    </span>
                  </td>
                  <td>{event.action}</td>
                  <td>
                    <span className="admin-activity-panel__entity-chip">
                      {getEntityLabel(event.entity, lang)}
                    </span>
                  </td>
                  <td className="admin-activity-panel__detail-cell" title={event.detail}>
                    {event.detail}
                  </td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => setDetail(event)}
                    >
                      <Eye size={14} aria-hidden="true" />
                      {d.viewDetail}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <AdminDetailModal
          title={d.activityDetailTitle}
          subtitle={detail.action}
          closeLabel={d.close}
          onClose={() => setDetail(null)}
        >
          <dl className="order-modal__dl">
            <div className="order-modal__row">
              <dt>{d.activityColTime}</dt>
              <dd>{formatActivityTimestamp(detail.timestamp, lang)}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.activityColUser}</dt>
              <dd>{detail.username}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.activityColRole}</dt>
              <dd>{t.roles[detail.role as keyof typeof t.roles] ?? detail.role}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.activityColAction}</dt>
              <dd>{detail.action}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.activityColEntity}</dt>
              <dd>{getEntityLabel(detail.entity, lang)}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.activityColDetail}</dt>
              <dd>{detail.detail}</dd>
            </div>
          </dl>
        </AdminDetailModal>
      )}
    </section>
  )
}
