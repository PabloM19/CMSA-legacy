import { useMemo, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AuditFilter } from '../../../types/admin'
import { getActivityLog, formatActivityTimestamp } from '../../../utils/activityLog'
import { filterActivityLog } from '../../../utils/activityLogHelpers'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminSearchBar } from './AdminSearchBar'

interface ActivityTabProps {
  refreshKey: number
}

const FILTERS: AuditFilter[] = [
  'all',
  'pedido',
  'validacion',
  'usuario',
  'empresa',
  'mesa',
  'paletizador',
  'sistema',
]

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

  const filterLabels: Record<AuditFilter, string> = {
    all: d.filterAll,
    pedido: d.filterOrders,
    validacion: d.filterValidation,
    usuario: d.filterUsers,
    empresa: d.filterCompanies,
    mesa: d.filterTables,
    paletizador: d.filterPalletizers,
    configuracion: d.filterSystem,
    autenticacion: d.filterSystem,
    tablet: d.filterSystem,
    sistema: d.filterSystem,
  }

  function objectiveFromDetail(detail: string): string {
    const part = detail.split('·')[0]?.trim()
    return part || '—'
  }

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
            key={f}
            type="button"
            className={`admin-filter-bar__btn${filter === f ? ' admin-filter-bar__btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{d.activityColTime}</th>
                <th>{d.activityColUser}</th>
                <th>{d.activityColRole}</th>
                <th>{d.activityColAction}</th>
                <th>{d.activityColObjective}</th>
                <th>{d.activityColDetail}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{formatActivityTimestamp(event.timestamp, lang)}</td>
                  <td>{event.username}</td>
                  <td>{t.roles[event.role as keyof typeof t.roles] ?? event.role}</td>
                  <td>{event.action}</td>
                  <td>{event.entity === 'pedido' ? objectiveFromDetail(event.detail) : '—'}</td>
                  <td>{event.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
