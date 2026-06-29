import { useMemo, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AuditFilter } from '../../../types/admin'
import { getActivityLog, formatActivityTimestamp } from '../../../utils/activityLog'
import { filterActivityLog, getEntityLabel } from '../../../utils/activityLogHelpers'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminSearchBar } from './AdminSearchBar'

interface ActivityTabProps {
  refreshKey: number
}

const FILTERS: { id: AuditFilter; labelKey: keyof typeof filterKeys }[] = [
  { id: 'all', labelKey: 'filterAll' },
  { id: 'pedido', labelKey: 'filterOrders' },
  { id: 'validacion', labelKey: 'filterValidation' },
  { id: 'usuario', labelKey: 'filterUsers' },
  { id: 'empresa', labelKey: 'filterCompanies' },
  { id: 'mesa', labelKey: 'filterTables' },
  { id: 'paletizador', labelKey: 'filterPalletizers' },
  { id: 'sistema', labelKey: 'filterSystem' },
]

const filterKeys = {
  filterAll: true,
  filterOrders: true,
  filterValidation: true,
  filterUsers: true,
  filterCompanies: true,
  filterTables: true,
  filterPalletizers: true,
  filterSystem: true,
} as const

export function ActivityTab({ refreshKey }: ActivityTabProps) {
  const { t, lang } = useLanguage()
  const d = t.admin

  void refreshKey

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<AuditFilter>('all')

  const events = useMemo(() => {
    const all = getActivityLog()
    return filterActivityLog(all, search, filter)
  }, [search, filter, refreshKey])

  return (
    <section className="admin-section dash-card">
      <div className="admin-section__intro">
        <div className="admin-section__icon" aria-hidden="true">
          <ScrollText size={32} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="admin-section__title">{d.tabs.activity}</h2>
          <p className="admin-section__desc">{d.sectionActivityDesc}</p>
        </div>
      </div>

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder={d.searchActivity}
        resultCount={events.length}
      />

      <div className="admin-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`admin-filter-bar__btn${filter === f.id ? ' admin-filter-bar__btn--active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {d[f.labelKey]}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <ul className="admin-card-list admin-activity-list">
          {events.map((event) => (
            <li key={event.id} className="admin-card admin-activity-card">
              <div className="admin-card__main">
                <div className="admin-card__head">
                  <strong className="admin-card__title">{event.action}</strong>
                  <span className="admin-badge admin-badge--master">
                    {getEntityLabel(event.entity, lang)}
                  </span>
                </div>
                <p className="admin-card__meta">{event.detail}</p>
                <div className="admin-card__tags">
                  <span className="admin-badge admin-badge--ok">{event.username}</span>
                  <span className="admin-badge admin-badge--master">{t.roles[event.role]}</span>
                </div>
                <p className="admin-card__foot">
                  {formatActivityTimestamp(event.timestamp, lang)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
