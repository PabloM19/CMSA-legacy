import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import { getState } from '../../../utils/backlogStorage'
import { canWithdrawProduction } from '../../../utils/permissions'
import { CompanyBadge } from '../../../components/ui/StatusBadge'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminSearchBar } from './AdminSearchBar'

interface ProductionTabProps {
  refreshKey: number
  onWithdraw: (order: BacklogOrder) => void
}

export function ProductionTab({ refreshKey, onWithdraw }: ProductionTabProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.admin

  const [query, setQuery] = useState('')

  const orders = useMemo(() => {
    void refreshKey
    return getState().orders.filter((o) => o.column === 'en_produccion')
  }, [refreshKey])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) =>
      [o.reference, o.product, o.variety, o.company].join(' ').toLowerCase().includes(q),
    )
  }, [orders, query])

  const canWithdraw = user ? canWithdrawProduction(user) : false

  return (
    <section className="admin-tab">
      <p className="admin-tab__desc">{d.sectionProductionDesc}</p>
      <AdminSearchBar
        value={query}
        onChange={setQuery}
        placeholder={d.searchProduction}
        resultCount={filtered.length}
      />
      {filtered.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t.backlog.reference}</th>
                <th>{t.backlog.product}</th>
                <th>{t.backlog.company}</th>
                <th>{t.backlog.tables}</th>
                <th>{d.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>{order.reference}</td>
                  <td>
                    {order.product} · {order.variety}
                  </td>
                  <td>
                    <CompanyBadge company={order.company} />
                  </td>
                  <td>{order.assignedTableIds?.join(', ') || '—'}</td>
                  <td>
                    {canWithdraw ? (
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        onClick={() => onWithdraw(order)}
                      >
                        {t.backlog.withdrawAction}
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
