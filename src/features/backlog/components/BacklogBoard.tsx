import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogColumnId, BacklogOrder } from '../../../types/backlog'
import { canActOnOrder } from '../../../utils/dashboardPermissions'
import { applyColumnMove, evaluateMove } from '../../../utils/backlogRules'
import { BACKLOG_COLUMNS, BacklogColumn } from './BacklogColumn'

interface BacklogBoardProps {
  orders: BacklogOrder[]
  activeDragId: string | null
  onDragStart: (id: string | null) => void
  onOrdersChange: (orders: BacklogOrder[]) => void
  onToast: (message: string, type: 'error' | 'success' | 'info') => void
  onConfirmIncident: (order: BacklogOrder) => void
  onViewDetail: (order: BacklogOrder) => void
  onSendValidation: (order: BacklogOrder) => void
  onMarkIncident: (order: BacklogOrder) => void
  onCancel: (order: BacklogOrder) => void
  onValidateTables: (order: BacklogOrder) => void
}

function findColumn(id: string, orders: BacklogOrder[]): BacklogColumnId | null {
  if (BACKLOG_COLUMNS.includes(id as BacklogColumnId)) return id as BacklogColumnId
  return orders.find((o) => o.id === id)?.column ?? null
}

export function BacklogBoard({
  orders,
  activeDragId,
  onDragStart,
  onOrdersChange,
  onToast,
  onConfirmIncident,
  onViewDetail,
  onSendValidation,
  onMarkIncident,
  onCancel,
  onValidateTables,
}: BacklogBoardProps) {
  const { user } = useAuth()
  const { lang } = useLanguage()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const activeOrder = activeDragId ? orders.find((o) => o.id === activeDragId) : null

  function handleDragStart(event: DragStartEvent) {
    onDragStart(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    onDragStart(null)
    if (!user) return

    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const order = orders.find((o) => o.id === activeId)
    if (!order) return

    const overId = String(over.id)
    const targetColumn = findColumn(overId, orders)
    if (!targetColumn) return

    if (targetColumn === order.column) {
      const colOrders = orders
        .filter((o) => o.column === targetColumn)
        .sort((a, b) => a.priority - b.priority)

      const oldIndex = colOrders.findIndex((o) => o.id === activeId)
      let newIndex = colOrders.findIndex((o) => o.id === overId)
      if (newIndex === -1) newIndex = colOrders.length - 1

      if (oldIndex === -1 || oldIndex === newIndex) return

      if (!canActOnOrder(user, order.company)) {
        onToast(
          lang === 'es'
            ? 'Acción no permitida para tu empresa.'
            : 'Action not allowed for your company.',
          'error',
        )
        return
      }

      const reordered = arrayMove(colOrders, oldIndex, newIndex)
      const next = orders.map((o) => {
        if (o.column !== targetColumn) return o
        const idx = reordered.findIndex((r) => r.id === o.id)
        return idx >= 0 ? { ...o, priority: idx + 1 } : o
      })
      onOrdersChange(next)
      return
    }

    const result = evaluateMove(user, order, targetColumn, lang)

    if (result.needsConfirm && result.confirmAction === 'incident') {
      onConfirmIncident(order)
      return
    }

    if (!result.ok) {
      onToast(result.message ?? '', result.toastType ?? 'error')
      return
    }

    const moved = applyColumnMove(order, targetColumn, user.name)
    const next = orders.map((o) => (o.id === order.id ? moved : o))
    onOrdersChange(next)

    if (result.message) {
      onToast(result.message, result.toastType ?? 'success')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="backlog-board">
        {BACKLOG_COLUMNS.map((columnId) => (
          <BacklogColumn
            key={columnId}
            columnId={columnId}
            orders={orders
              .filter((o) => o.column === columnId)
              .sort((a, b) => a.priority - b.priority)}
            onViewDetail={onViewDetail}
            onSendValidation={onSendValidation}
            onMarkIncident={onMarkIncident}
            onCancel={onCancel}
            onValidateTables={onValidateTables}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeOrder ? (
          <div
            className={`backlog-card backlog-card--overlay order-card--${activeOrder.company.toLowerCase()}`}
          >
            <span className="backlog-card__ref">{activeOrder.reference}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
