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
import { useMemo, useState } from 'react'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogColumnId, BacklogOrder } from '../../../types/backlog'
import type { PlantTable } from '../../../types/plant'
import { canActOnOrder } from '../../../utils/dashboardPermissions'
import { evaluateMove } from '../../../utils/backlogRules'
import { executeColumnMove } from '../../../utils/backlogMove'
import { filterOrdersForView } from '../../../utils/backlogViewFilters'
import {
  resolveVisibleLimit,
  type BacklogDensity,
  type BacklogViewMode,
} from '../../../utils/backlogViewPrefs'
import { BACKLOG_COLUMNS, BacklogColumn } from './BacklogColumn'
import { BacklogColumnDrawer } from './BacklogColumnDrawer'
import { BacklogBoardScrollArea } from './BacklogBoardScrollArea'

interface BacklogBoardProps {
  orders: BacklogOrder[]
  plantTables: PlantTable[]
  activeDragId: string | null
  viewMode: BacklogViewMode
  density: BacklogDensity
  onDragStart: (id: string | null) => void
  onOrdersChange: (orders: BacklogOrder[], plantTables: PlantTable[]) => void
  onToast: (message: string, type: 'error' | 'success' | 'info') => void
  onConfirmIncident: (order: BacklogOrder) => void
  onConfirmFinalize: (order: BacklogOrder) => void
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

function sortColumnOrders(orders: BacklogOrder[], columnId: BacklogColumnId): BacklogOrder[] {
  return orders
    .filter((o) => o.column === columnId)
    .sort((a, b) => a.priority - b.priority)
}

export function BacklogBoard({
  orders,
  plantTables,
  activeDragId,
  viewMode,
  density,
  onDragStart,
  onOrdersChange,
  onToast,
  onConfirmIncident,
  onConfirmFinalize,
  onViewDetail,
  onSendValidation,
  onMarkIncident,
  onCancel,
  onValidateTables,
}: BacklogBoardProps) {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.backlog

  const [drawerColumn, setDrawerColumn] = useState<BacklogColumnId | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const filteredOrders = useMemo(
    () => filterOrdersForView(orders, viewMode, user),
    [orders, viewMode, user],
  )

  const visibleLimit = resolveVisibleLimit(viewMode, density)
  const scrollable = viewMode === 'full'
  const compactCards = viewMode !== 'full'
  const isSummaryMode = viewMode === 'summary'

  const boardEmpty =
    (viewMode === 'attention' || viewMode === 'mine') && filteredOrders.length === 0

  const emptyBoardMessage =
    viewMode === 'attention' ? d.emptyAttention : viewMode === 'mine' ? d.emptyMine : ''

  const columnEmptyMessage =
    viewMode === 'attention'
      ? d.emptyAttentionColumn
      : viewMode === 'mine'
        ? d.emptyMineColumn
        : undefined

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
      onOrdersChange(next, plantTables)
      return
    }

    const result = evaluateMove(user, order, targetColumn, lang)

    if (result.needsConfirm && result.confirmAction === 'incident') {
      onConfirmIncident(order)
      return
    }

    if (result.needsConfirm && result.confirmAction === 'finalize') {
      onConfirmFinalize(order)
      return
    }

    if (!result.ok) {
      onToast(result.message ?? '', result.toastType ?? 'error')
      return
    }

    const moveResult = executeColumnMove(
      orders,
      plantTables,
      order,
      targetColumn,
      user.name,
      lang,
    )

    if (!moveResult.success) {
      onToast(moveResult.message ?? '', 'error')
      return
    }

    onOrdersChange(moveResult.orders, moveResult.plantTables)

    if (result.message) {
      onToast(result.message, result.toastType ?? 'success')
    }
  }

  function handlePrepare(order: BacklogOrder) {
    if (!user) return
    const result = evaluateMove(user, order, 'pendiente_lanzamiento', lang)
    if (!result.ok) {
      onToast(result.message ?? '', result.toastType ?? 'error')
      return
    }
    const moveResult = executeColumnMove(
      orders,
      plantTables,
      order,
      'pendiente_lanzamiento',
      user.name,
      lang,
    )
    if (!moveResult.success) {
      onToast(moveResult.message ?? '', 'error')
      return
    }
    onOrdersChange(moveResult.orders, moveResult.plantTables)
    if (result.message) onToast(result.message, result.toastType ?? 'success')
  }

  return (
    <>
      {boardEmpty && (
        <EmptyState title={emptyBoardMessage} className="backlog-board-empty" />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <BacklogBoardScrollArea hidden={boardEmpty}>
          <div className={`backlog-board${boardEmpty ? ' backlog-board--hidden' : ''}`}>
            {BACKLOG_COLUMNS.map((columnId) => {
              const columnOrders = sortColumnOrders(filteredOrders, columnId)
              const allInColumn = sortColumnOrders(orders, columnId)
              const sourceForLimit = isSummaryMode ? allInColumn : columnOrders

              return (
                <BacklogColumn
                  key={columnId}
                  columnId={columnId}
                  orders={columnOrders}
                  allOrdersInColumn={sourceForLimit}
                  visibleLimit={visibleLimit}
                  scrollable={scrollable}
                  compactCards={compactCards}
                  summaryMode={isSummaryMode}
                  emptyMessage={columnEmptyMessage}
                  onViewAll={
                    isSummaryMode &&
                    visibleLimit != null &&
                    sourceForLimit.length > visibleLimit
                      ? () => setDrawerColumn(columnId)
                      : undefined
                  }
                  onViewDetail={onViewDetail}
                  onSendValidation={onSendValidation}
                  onPrepare={handlePrepare}
                  onMarkIncident={onMarkIncident}
                  onCancel={onCancel}
                  onValidateTables={onValidateTables}
                />
              )
            })}
          </div>
        </BacklogBoardScrollArea>

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

      {drawerColumn && (
        <BacklogColumnDrawer
          columnId={drawerColumn}
          orders={sortColumnOrders(
            viewMode === 'summary' ? orders : filteredOrders,
            drawerColumn,
          )}
          onClose={() => setDrawerColumn(null)}
          onViewDetail={onViewDetail}
          onSendValidation={onSendValidation}
          onPrepare={handlePrepare}
        />
      )}
    </>
  )
}
