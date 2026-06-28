import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Cog,
  Hand,
} from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder, ValidationTable } from '../../../types/backlog'
import { canPerformValidation } from '../../../utils/permissions'
import type { User } from '../../../types/auth'

interface ValidationTableCardProps {
  table: ValidationTable
  order: BacklogOrder
  user: User
  onValidateTable: (tableId: string) => void
  onMarkConflict: (tableId: string) => void
  onResolveConflict: (tableId: string) => void
}

function StatusIcon({ status }: { status: ValidationTable['status'] }) {
  if (status === 'validada') return <CheckCircle2 size={22} strokeWidth={1.75} />
  if (status === 'conflicto') return <AlertTriangle size={22} strokeWidth={1.75} />
  if (status === 'parada') return <Ban size={22} strokeWidth={1.75} />
  return <Clock size={22} strokeWidth={1.75} />
}

function statusLabel(
  status: ValidationTable['status'],
  d: {
    statusValidated: string
    statusConflict: string
    statusStopped: string
    statusPending: string
  },
) {
  switch (status) {
    case 'validada':
      return d.statusValidated
    case 'conflicto':
      return d.statusConflict
    case 'parada':
      return d.statusStopped
    default:
      return d.statusPending
  }
}

export function ValidationTableCard({
  table,
  order,
  user,
  onValidateTable,
  onMarkConflict,
  onResolveConflict,
}: ValidationTableCardProps) {
  const { t } = useLanguage()
  const d = t.validation
  const canAct = canPerformValidation(user)

  const canValidate = canAct && table.status === 'pendiente'
  const canConflict = canAct && table.status !== 'conflicto' && table.status !== 'validada'
  const canResolve = canAct && table.status === 'conflicto'

  return (
    <article
      className={`validation-table-card validation-table-card--${table.status} validation-table-card--${order.company.toLowerCase()}`}
    >
      <div className="validation-table-card__head">
        <div className="validation-table-card__icon" aria-hidden="true">
          <StatusIcon status={table.status} />
        </div>
        <div className="validation-table-card__main">
          <h3 className="validation-table-card__name">{table.name}</h3>
          <div className="validation-table-card__badges">
            <span
              className={`validation-table-card__status validation-table-card__status--${table.status}`}
            >
              {statusLabel(table.status, d)}
            </span>
            <span className="validation-table-card__type">
              {table.type === 'automatic' ? (
                <>
                  <Cog size={12} aria-hidden="true" /> {d.typeAutomatic}
                </>
              ) : (
                <>
                  <Hand size={12} aria-hidden="true" /> {d.typeManual}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <dl className="validation-table-card__meta">
        <div>
          <dt>{d.tableCompany}</dt>
          <dd>{table.company}</dd>
        </div>
        <div>
          <dt>{d.tableOrder}</dt>
          <dd>{table.orderReference}</dd>
        </div>
      </dl>

      {table.conflictReason && (
        <p className="validation-table-card__conflict">{table.conflictReason}</p>
      )}

      <div className="validation-table-card__actions">
        {canValidate && (
          <button
            type="button"
            className="validation-btn validation-btn--primary"
            onClick={() => onValidateTable(table.id)}
          >
            {d.validateTable}
          </button>
        )}
        {canConflict && (
          <button
            type="button"
            className="validation-btn validation-btn--warn"
            onClick={() => onMarkConflict(table.id)}
          >
            {d.markConflict}
          </button>
        )}
        {canResolve && (
          <button
            type="button"
            className="validation-btn"
            onClick={() => onResolveConflict(table.id)}
          >
            {d.resolveConflict}
          </button>
        )}
      </div>
    </article>
  )
}
