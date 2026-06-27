import { useMemo, useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AuditFilter } from '../../../types/admin'
import { getAuditLog } from '../../../utils/adminStorage'

interface AuditTabProps {
  refreshKey: number
}

const FILTERS: { id: AuditFilter; labelKey: keyof typeof filterKeys }[] = [
  { id: 'all', labelKey: 'filterAll' },
  { id: 'usuario', labelKey: 'filterUsers' },
  { id: 'empresa', labelKey: 'filterCompanies' },
  { id: 'mesa', labelKey: 'filterTables' },
  { id: 'paletizador', labelKey: 'filterPalletizers' },
  { id: 'configuracion', labelKey: 'filterConfig' },
  { id: 'pedido', labelKey: 'filterOrders' },
]

const filterKeys = {
  filterAll: true,
  filterUsers: true,
  filterCompanies: true,
  filterTables: true,
  filterPalletizers: true,
  filterConfig: true,
  filterOrders: true,
} as const

export function AuditTab({ refreshKey }: AuditTabProps) {
  const { t } = useLanguage()
  const d = t.admin

  void refreshKey

  const [filter, setFilter] = useState<AuditFilter>('all')
  const events = useMemo(() => {
    const all = getAuditLog()
    if (filter === 'all') return all
    return all.filter((e) => e.entity === filter)
  }, [filter, refreshKey])

  return (
    <section className="admin-panel dash-card">
      <div className="admin-panel__head">
        <h2 className="admin-panel__title">{d.tabs.audit}</h2>
      </div>

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

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{d.auditDate}</th>
              <th>{d.colUsername}</th>
              <th>{d.auditAction}</th>
              <th>{d.auditEntity}</th>
              <th>{d.auditDetail}</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{new Date(ev.timestamp).toLocaleString('es-ES')}</td>
                <td>{ev.username}</td>
                <td>{ev.action}</td>
                <td>{ev.entity}</td>
                <td>{ev.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
