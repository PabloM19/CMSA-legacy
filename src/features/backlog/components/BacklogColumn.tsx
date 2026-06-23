import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogColumnId, BacklogOrder } from '../../../types/backlog'
import { BacklogOrderCard } from './BacklogOrderCard'

interface BacklogColumnProps {
  columnId: BacklogColumnId
  orders: BacklogOrder[]
  onViewDetail: (order: BacklogOrder) => void
  onSendValidation: (order: BacklogOrder) => void
  onMarkIncident: (order: BacklogOrder) => void
  onCancel: (order: BacklogOrder) => void
  onValidateTables: (order: BacklogOrder) => void
}

export function BacklogColumn({
  columnId,
  orders,
  onViewDetail,
  onSendValidation,
  onMarkIncident,
  onCancel,
  onValidateTables,
}: BacklogColumnProps) {
  const { t } = useLanguage()
  const d = t.backlog
  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  return (
    <section
      ref={setNodeRef}
      className={`backlog-column${isOver ? ' backlog-column--over' : ''}`}
    >
      <header className="backlog-column__head">
        <h2 className="backlog-column__title">{d.columns[columnId]}</h2>
        <span className="backlog-column__count">{orders.length}</span>
      </header>
      <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className="backlog-column__list">
          {orders.map((order) => (
            <BacklogOrderCard
              key={order.id}
              order={order}
              onViewDetail={onViewDetail}
              onSendValidation={onSendValidation}
              onMarkIncident={onMarkIncident}
              onCancel={onCancel}
              onValidateTables={onValidateTables}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  )
}

export const BACKLOG_COLUMNS: BacklogColumnId[] = [
  'en_backlog',
  'pendiente_lanzamiento',
  'pendiente_validacion',
  'en_ejecucion',
  'bloqueado',
  'finalizado',
]
