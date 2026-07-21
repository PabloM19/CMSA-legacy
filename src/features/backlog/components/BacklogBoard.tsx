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
import { evaluateMove, MAIN_BOARD_COLUMNS } from '../../../utils/backlogRules'
import { executeColumnMove } from '../../../utils/backlogMove'
import { logOrderAccepted } from '../../../utils/activityLogActions'
import { filterOrdersForView } from '../../../utils/backlogViewFilters'
import {
  resolveVisibleLimit,
  type BacklogDensity,
  type BacklogViewMode,
} from '../../../utils/backlogViewPrefs'
import { BACKLOG_COLUMNS, BacklogColumn } from './BacklogColumn'
import { BacklogColumnDrawer } from './BacklogColumnDrawer'
import { BacklogBoardScrollArea } from './BacklogBoardScrollArea'
import { PrepareObjectiveModal } from './PrepareObjectiveModal'

interface BacklogBoardProps {
  orders: BacklogOrder[]
  plantTables: PlantTable[]
  activeDragId: string | null
  viewMode: BacklogViewMode
  density: BacklogDensity
  onDragStart: (id: string | null) => void
  onOrdersChange: (orders: BacklogOrder[], plantTables: PlantTable[]) => void
  onToast: (message: string, type: 'error' | 'success' | 'info') => void
  onConfirmFinalize: (order: BacklogOrder) => void
  onViewDetail: (order: BacklogOrder) => void
  onConfirmRecipe: (order: BacklogOrder) => void
  onWithdraw?: (order: BacklogOrder) => void
}

function findColumn(id: string, orders: BacklogOrder[]): BacklogColumnId | null {
  if (BACKLOG_COLUMNS.includes(id as BacklogColumnId)) return id as BacklogColumnId
  const order = orders.find((o) => o.id === id)
  if (!order) return null
  if (order.column === 'finalizado') return 'en_produccion'
  return order.column
}

function sortColumnOrders(orders: BacklogOrder[], columnId: BacklogColumnId): BacklogOrder[] {
  if (columnId === 'en_produccion') {
    return orders
      .filter((o) => o.column === 'en_produccion')
      .sort((a, b) => a.priority - b.priority)
  }
  return orders
    .filter((o) => o.column === columnId)
    .sort((a, b) => a.priority - b.priority)
}

function sortCompletedOrders(orders: BacklogOrder[]): BacklogOrder[] {
  return orders
    .filter((o) => o.column === 'finalizado')
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
  onConfirmFinalize,
  onViewDetail,
  onConfirmRecipe,
  onWithdraw,
}: BacklogBoardProps) {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.backlog

  const [drawerColumn, setDrawerColumn] = useState<BacklogColumnId | 'finalizado' | null>(null)
  const [prepareOrder, setPrepareOrder] = useState<BacklogOrder | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const filteredOrders = useMemo(
    () => filterOrdersForView(orders, viewMode, user),
    [orders, viewMode, user],
  )

  const completedOrders = useMemo(
    () => sortCompletedOrders(filteredOrders),
    [filteredOrders],
  )

  const visibleLimit = resolveVisibleLimit(viewMode, density)
  const scrollable = viewMode === 'full'
  const compactCards = viewMode !== 'full'
  const isSummaryMode = viewMode === 'summary'

  const isCompletedView = viewMode === 'completed'
  const isInProgressView = viewMode === 'in_progress'

  const boardEmpty =
    (isInProgressView || isCompletedView) && filteredOrders.length === 0

  const emptyBoardMessage =
    isInProgressView ? d.emptyInProgress : isCompletedView ? d.emptyCompleted : ''

  const columnEmptyMessage =
    isInProgressView ? d.emptyInProgressColumn : undefined

  const showCompletedInProduction = !isCompletedView && !isInProgressView

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

    const effectiveTarget =
      targetColumn === 'en_produccion' && order.column === 'finalizado'
        ? order.column
        : targetColumn

    if (effectiveTarget === order.column || (order.column === 'finalizado' && targetColumn === 'en_produccion')) {
      if (order.column !== 'finalizado' && targetColumn === order.column) {
        const colOrders = sortColumnOrders(orders, targetColumn)
        const oldIndex = colOrders.findIndex((o) => o.id === activeId)
        let newIndex = colOrders.findIndex((o) => o.id === overId)
        if (newIndex === -1) newIndex = colOrders.length - 1
        if (oldIndex === -1 || oldIndex === newIndex) return

        if (!canActOnOrder(user, order.company)) {
          onToast(d.noPermission, 'error')
          return
        }

        const reordered = arrayMove(colOrders, oldIndex, newIndex)
        const next = orders.map((o) => {
          if (o.column !== targetColumn) return o
          const idx = reordered.findIndex((r) => r.id === o.id)
          return idx >= 0 ? { ...o, priority: idx + 1 } : o
        })
        onOrdersChange(next, plantTables)
      }
      return
    }

    const result = evaluateMove(user, order, effectiveTarget, lang)

    if (result.needsPrepareModal) {
      setPrepareOrder(order)
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
      effectiveTarget,
      user,
      lang,
    )

    if (!moveResult.success) {
      onToast(moveResult.message ?? '', 'error')
      return
    }

    onOrdersChange(moveResult.orders, moveResult.plantTables)
    if (result.message) onToast(result.message, result.toastType ?? 'success')
  }

  function handlePrepare(order: BacklogOrder) {
    setPrepareOrder(order)
  }

  function handlePrepareConfirm(nextOrder: BacklogOrder, nextPlant: PlantTable[]) {
    if (user) {
      logOrderAccepted(user, nextOrder.reference)
    }
    const nextOrders = orders.map((o) => (o.id === nextOrder.id ? nextOrder : o))
    onOrdersChange(nextOrders, nextPlant)
    setPrepareOrder(null)
    onToast(d.prepareSuccess, 'success')
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
          <div
            className={`backlog-board${boardEmpty ? ' backlog-board--hidden' : ''}${isCompletedView ? ' backlog-board--completed-only' : ''}`}
          >
            {isCompletedView ? (
              <BacklogColumn
                key="finalizado"
                columnId="finalizado"
                orders={completedOrders}
                allOrdersInColumn={completedOrders}
                visibleLimit={visibleLimit}
                scrollable={scrollable}
                compactCards={compactCards}
                summaryMode={isSummaryMode}
                emptyMessage={d.emptyCompleted}
                onViewAll={
                  visibleLimit != null && completedOrders.length > visibleLimit
                    ? () => setDrawerColumn('finalizado')
                    : undefined
                }
                onViewDetail={onViewDetail}
                onPrepare={handlePrepare}
                onConfirmRecipe={onConfirmRecipe}
                onWithdraw={onWithdraw}
              />
            ) : (
              MAIN_BOARD_COLUMNS.map((columnId) => {
                const columnOrders = sortColumnOrders(filteredOrders, columnId)
                const allInColumn = sortColumnOrders(orders, columnId)
                const sourceForLimit = isSummaryMode ? allInColumn : columnOrders

                return (
                  <BacklogColumn
                    key={columnId}
                    columnId={columnId}
                    orders={columnOrders}
                    completedOrders={
                      showCompletedInProduction && columnId === 'en_produccion'
                        ? completedOrders
                        : []
                    }
                    allOrdersInColumn={sourceForLimit}
                    visibleLimit={visibleLimit}
                    scrollable={scrollable}
                    compactCards={compactCards}
                    summaryMode={isSummaryMode}
                    emptyMessage={columnEmptyMessage}
                    onViewAll={
                      visibleLimit != null && sourceForLimit.length > visibleLimit
                        ? () => setDrawerColumn(columnId)
                        : undefined
                    }
                    onViewAllCompleted={
                      showCompletedInProduction &&
                      columnId === 'en_produccion' &&
                      visibleLimit != null &&
                      completedOrders.length > visibleLimit
                        ? () => setDrawerColumn('finalizado')
                        : undefined
                    }
                    onViewDetail={onViewDetail}
                    onPrepare={handlePrepare}
                    onConfirmRecipe={onConfirmRecipe}
                onWithdraw={onWithdraw}
                  />
                )
              })
            )}
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
          columnId={drawerColumn === 'finalizado' ? 'finalizado' : drawerColumn}
          orders={
            drawerColumn === 'finalizado'
              ? sortCompletedOrders(
                  viewMode === 'summary' || viewMode === 'full' ? orders : filteredOrders,
                )
              : sortColumnOrders(
                  viewMode === 'summary' || viewMode === 'full' ? orders : filteredOrders,
                  drawerColumn,
                )
          }
          onClose={() => setDrawerColumn(null)}
          onViewDetail={onViewDetail}
          onPrepare={handlePrepare}
          onConfirmRecipe={onConfirmRecipe}
          onWithdraw={onWithdraw}
        />
      )}

      {prepareOrder && (
        <PrepareObjectiveModal
          order={prepareOrder}
          plantTables={plantTables}
          onClose={() => setPrepareOrder(null)}
          onConfirm={handlePrepareConfirm}
        />
      )}
    </>
  )
}
