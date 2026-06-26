import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder, ValidationTable } from '../../../types/backlog'
import { canPerformValidation } from '../../../utils/permissions'
import {
  canStartProduction,
  getTableStats,
  hasTableConflicts,
} from '../../../utils/validationHelpers'
import type { User } from '../../../types/auth'

interface ValidationDetailPanelProps {
  order: BacklogOrder
  user: User
  onValidateTable: (tableId: string) => void
  onValidateAll: () => void
  onMarkConflict: (tableId: string) => void
  onResolveConflict: (tableId: string) => void
  onStartProduction: () => void
}

function statusLabel(status: ValidationTable['status'], d: {
  statusValidated: string
  statusConflict: string
  statusStopped: string
  statusPending: string
}) {
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
  const canAct = canPerformValidation(user)
  const stats = getTableStats(order)
  const ready = canStartProduction(order)
  const conflict = hasTableConflicts(order)

  return (
    <section className="validation-detail">
      <header className="validation-detail__head">
        <div>
          <h2 className="validation-detail__title">{order.reference}</h2>
          <p className="validation-detail__subtitle">
            {order.product} · {order.variety}
          </p>
        </div>
        <span className={`dash-chip dash-chip--${order.company.toLowerCase()}`}>
          {order.company}
        </span>
      </header>

      {!canAct && (
        <p className="validation-detail__notice validation-detail__notice--readonly">{d.readOnlyNotice}</p>
      )}

      {conflict && (
        <p className="validation-detail__notice validation-detail__notice--warn">
          {d.conflictBlockNotice}
        </p>
      )}
      {!ready && !conflict && stats.pending > 0 && (
        <p className="validation-detail__notice">{d.cannotStartNotice}</p>
      )}
      {ready && (
        <p className="validation-detail__notice validation-detail__notice--ok">{d.allTablesValidated}</p>
      )}

      <div className="validation-detail__toolbar">
        {canAct && stats.pending > 0 && (
          <button type="button" className="validation-btn" onClick={onValidateAll}>
            {d.validateAll}
          </button>
        )}
        {canAct && ready && (
          <button
            type="button"
            className="validation-btn validation-btn--primary"
            onClick={onStartProduction}
          >
            {d.startProduction}
          </button>
        )}
      </div>

      <h3 className="validation-detail__section-title">{d.tablesTitle}</h3>

      <div className="validation-tables">
        {(order.validationTables ?? []).map((table) => {
          const canValidate = canAct && table.status === 'pendiente'
          const canConflict = canAct && table.status !== 'conflicto' && table.status !== 'validada'
          const canResolve = canAct && table.status === 'conflicto'

          return (
            <article
              key={table.id}
              className={`validation-table table table--${table.type} table--${order.company.toLowerCase()} table--${table.status === 'validada' ? 'validated' : table.status === 'conflicto' ? 'conflict' : 'pending_validation'} validation-table--${table.status}`}
            >
              <div className="validation-table__main">
                <div>
                  <strong className="validation-table__name">{table.name}</strong>
                  <p className="validation-table__meta">
                    {d.tableType}:{' '}
                    {table.type === 'automatic' ? d.typeAutomatic : d.typeManual}
                  </p>
                </div>
                <div className="validation-table__badges">
                  <span className={`validation-table__badge validation-table__badge--${table.status}`}>
                    {statusLabel(table.status, d)}
                  </span>
                  {table.type === 'manual' && (
                    <span className="validation-table__badge validation-table__badge--manual-type">
                      {d.manualBadge}
                    </span>
                  )}
                </div>
              </div>

              <dl className="validation-table__dl">
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
                <p className="validation-table__conflict">{table.conflictReason}</p>
              )}

              <div className="validation-table__actions">
                {canValidate && (
                  <button
                    type="button"
                    className="validation-btn validation-btn--small"
                    onClick={() => onValidateTable(table.id)}
                  >
                    {d.validateTable}
                  </button>
                )}
                {canConflict && (
                  <button
                    type="button"
                    className="validation-btn validation-btn--small validation-btn--warn"
                    onClick={() => onMarkConflict(table.id)}
                  >
                    {d.markConflict}
                  </button>
                )}
                {canResolve && (
                  <button
                    type="button"
                    className="validation-btn validation-btn--small"
                    onClick={() => onResolveConflict(table.id)}
                  >
                    {d.resolveConflict}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
