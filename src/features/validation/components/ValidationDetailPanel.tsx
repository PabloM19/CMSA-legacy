import { ClipboardList } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import type { User } from '../../../types/auth'
import { ValidationActionBar } from './ValidationActionBar'
import { ValidationOrderSummary } from './ValidationOrderSummary'
import { ValidationTableCard } from './ValidationTableCard'

interface ValidationDetailPanelProps {
  order: BacklogOrder
  user: User
  onValidateTable: (tableId: string) => void
  onValidateAll: () => void
  onMarkConflict: (tableId: string) => void
  onResolveConflict: (tableId: string) => void
  onStartProduction: () => void
}

export function ValidationDetailPanel({
  order,
  user,
  onValidateTable,
  onValidateAll,
  onMarkConflict,
  onResolveConflict,
  onStartProduction,
}: ValidationDetailPanelProps) {
  const { t } = useLanguage()
  const d = t.validation

  return (
    <div className="validation-detail">
      <ValidationOrderSummary order={order} />

      <section className="validation-detail__tables">
        <h3 className="validation-detail__section-title">{d.tablesTitle}</h3>
        <div className="validation-detail__table-grid">
          {(order.validationTables ?? []).map((table) => (
            <ValidationTableCard
              key={table.id}
              table={table}
              order={order}
              user={user}
              onValidateTable={onValidateTable}
              onMarkConflict={onMarkConflict}
              onResolveConflict={onResolveConflict}
            />
          ))}
        </div>
      </section>

      <ValidationActionBar
        order={order}
        user={user}
        onValidateAll={onValidateAll}
        onStartProduction={onStartProduction}
      />
    </div>
  )
}

export function ValidationDetailPlaceholder() {
  const { t } = useLanguage()
  const d = t.validation

  return (
    <div className="validation-panel__placeholder dash-card">
      <ClipboardList size={36} strokeWidth={1.5} aria-hidden="true" />
      <p className="validation-panel__placeholder-title">{d.selectOrderTitle}</p>
      <p>{d.selectOrder}</p>
    </div>
  )
}
