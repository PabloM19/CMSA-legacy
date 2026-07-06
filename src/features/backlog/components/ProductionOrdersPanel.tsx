import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ClipboardList, Factory } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import {
  isCompletedProductionOrder,
  isInProductionColumn,
  isPendingAcceptanceColumn,
} from '../../../utils/dailyOrderHelpers'
import { resolveVisibleLimit, type BacklogViewMode } from '../../../utils/backlogViewPrefs'
import { useBacklogView } from '../hooks/useBacklogView'
import { BacklogBoardSkeleton } from './BacklogBoardSkeleton'
import { BacklogColumnDrawer } from './BacklogColumnDrawer'
import { BacklogOrderCard } from './BacklogOrderCard'
import { BacklogViewControls } from './BacklogViewControls'

type ProductionDrawerColumn = 'pending' | 'in_production' | 'completed'

interface ProductionOrdersPanelProps {
  orders: BacklogOrder[]
  onViewDetail: (order: BacklogOrder) => void
  onPrepare?: (order: BacklogOrder) => void
  onConfirmCell?: (order: BacklogOrder) => void
  onWithdraw?: (order: BacklogOrder) => void
}

interface KanbanColumnProps {
  icon: LucideIcon
  title: string
  hint: string
  count: number
  emptyMessage: string
  orders: BacklogOrder[]
  allOrdersInColumn: BacklogOrder[]
  completedOrders?: BacklogOrder[]
  showCompletedSection?: boolean
  visibleLimit: number | null
  scrollable: boolean
  compactCards: boolean
  summaryMode: boolean
  onViewAll?: () => void
  onViewAllCompleted?: () => void
  onViewDetail: (order: BacklogOrder) => void
  onPrepare?: (order: BacklogOrder) => void
  onConfirmCell?: (order: BacklogOrder) => void
  onWithdraw?: (order: BacklogOrder) => void
}

function ProductionKanbanColumn({
  icon: Icon,
  title,
  hint,
  count,
  emptyMessage,
  orders,
  allOrdersInColumn,
  completedOrders = [],
  showCompletedSection = false,
  visibleLimit,
  scrollable,
  compactCards,
  summaryMode,
  onViewAll,
  onViewAllCompleted,
  onViewDetail,
  onPrepare,
  onConfirmCell,
  onWithdraw,
}: KanbanColumnProps) {
  const { t } = useLanguage()
  const d = t.backlog

  const displayOrders = visibleLimit != null ? orders.slice(0, visibleLimit) : orders
  const hiddenCount = allOrdersInColumn.length - displayOrders.length
  const showMoreFooter = visibleLimit != null && hiddenCount > 0 && onViewAll
  const isEmpty = count === 0 && completedOrders.length === 0

  const completedVisible =
    visibleLimit != null ? completedOrders.slice(0, visibleLimit) : completedOrders
  const completedHidden =
    visibleLimit != null ? completedOrders.length - completedVisible.length : 0

  return (
    <section
      className={`production-orders-column${scrollable ? ' production-orders-column--scroll' : ''}`}
      aria-label={title}
    >
      <header className="production-orders-column__head">
        <div className="production-orders-column__head-main">
          <span className="production-orders-column__icon" aria-hidden="true">
            <Icon size={20} strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="production-orders-column__title">{title}</h2>
            <p className="production-orders-column__hint">{hint}</p>
          </div>
        </div>
        <span className="production-orders-column__count">{count}</span>
      </header>

      <div className="production-orders-column-body">
        {isEmpty && <p className="production-orders-column__empty">{emptyMessage}</p>}

        {displayOrders.map((order) => (
          <BacklogOrderCard
            key={order.id}
            order={order}
            sortable={false}
            compact={compactCards}
            completed={isCompletedProductionOrder(order)}
            onViewDetail={onViewDetail}
            onPrepare={onPrepare}
            onConfirmRecipe={onConfirmCell}
            onWithdraw={onWithdraw}
          />
        ))}

        {showMoreFooter && (
          <div
            className={`backlog-column__more${summaryMode ? ' backlog-column__more--summary' : ''}`}
          >
            <p className="backlog-column__more-label">
              {d.moreOrders.replace('{count}', String(hiddenCount))}
            </p>
            <button type="button" className="backlog-column__view-all" onClick={onViewAll}>
              {d.viewAll}
            </button>
          </div>
        )}

        {showCompletedSection && completedOrders.length > 0 && (
          <div className="production-orders-column__completed">
            <h3 className="production-orders-column__completed-title">{d.completedSectionTitle}</h3>
            {completedVisible.map((order) => (
              <BacklogOrderCard
                key={order.id}
                order={order}
                sortable={false}
                compact={compactCards}
                completed
                onViewDetail={onViewDetail}
              />
            ))}
            {completedHidden > 0 && onViewAllCompleted && (
              <button
                type="button"
                className="backlog-column__view-all backlog-column__view-all--completed"
                onClick={onViewAllCompleted}
              >
                {d.viewAllCompleted}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function filterForProductionView(
  pending: BacklogOrder[],
  inProduction: BacklogOrder[],
  completed: BacklogOrder[],
  viewMode: BacklogViewMode,
) {
  if (viewMode === 'completed') {
    return { pending: [] as BacklogOrder[], inProduction: completed, completed: [] as BacklogOrder[] }
  }
  if (viewMode === 'in_progress') {
    return { pending, inProduction, completed: [] as BacklogOrder[] }
  }
  return { pending, inProduction, completed }
}

export function ProductionOrdersPanel({
  orders,
  onViewDetail,
  onPrepare,
  onConfirmCell,
  onWithdraw,
}: ProductionOrdersPanelProps) {
  const { t } = useLanguage()
  const d = t.backlog
  const p = t.productionOrdersPage
  const {
    viewMode,
    density,
    isLoading,
    changeViewMode,
    changeDensity,
    densityDisabled,
  } = useBacklogView()
  const [drawerColumn, setDrawerColumn] = useState<ProductionDrawerColumn | null>(null)

  const pendingAll = useMemo(
    () => orders.filter(isPendingAcceptanceColumn).sort((a, b) => a.priority - b.priority),
    [orders],
  )
  const inProductionAll = useMemo(
    () => orders.filter(isInProductionColumn).sort((a, b) => a.priority - b.priority),
    [orders],
  )
  const completedAll = useMemo(
    () => orders.filter(isCompletedProductionOrder).sort((a, b) => a.priority - b.priority),
    [orders],
  )

  const { pending, inProduction, completed } = useMemo(
    () => filterForProductionView(pendingAll, inProductionAll, completedAll, viewMode),
    [pendingAll, inProductionAll, completedAll, viewMode],
  )

  const visibleLimit = resolveVisibleLimit(viewMode, density)
  const scrollable = viewMode === 'full'
  const compactCards = viewMode !== 'full'
  const isSummaryMode = viewMode === 'summary'
  const isCompletedView = viewMode === 'completed'
  const isInProgressView = viewMode === 'in_progress'
  const showCompletedInProduction = !isCompletedView && !isInProgressView

  const pendingCount = isCompletedView ? 0 : pendingAll.length
  const inProductionCount = isCompletedView ? completedAll.length : inProductionAll.length

  const drawerConfig = useMemo(() => {
    if (!drawerColumn) return null
    if (drawerColumn === 'pending') {
      return {
        title: d.colPendingAcceptance,
        orders: pendingAll,
        completed: false,
      }
    }
    if (drawerColumn === 'in_production') {
      return {
        title: d.colInProduction,
        orders: inProductionAll,
        completed: false,
      }
    }
    return {
      title: d.completedSectionTitle,
      orders: completedAll,
      completed: true,
    }
  }, [drawerColumn, d, pendingAll, inProductionAll, completedAll])

  return (
    <section className="production-orders" aria-label={p.title}>
      <BacklogViewControls
        viewMode={viewMode}
        density={density}
        densityDisabled={densityDisabled}
        onViewModeChange={changeViewMode}
        onDensityChange={changeDensity}
      />

      {isLoading ? (
        <div className="production-orders-board-wrap">
          <BacklogBoardSkeleton columnCount={2} />
        </div>
      ) : (
        <div className="production-orders-board-wrap">
          <div className="production-orders-board">
            <ProductionKanbanColumn
              icon={ClipboardList}
              title={d.colPendingAcceptance}
              hint={d.productionKanbanPendingHint}
              count={pendingCount}
              emptyMessage={isCompletedView ? d.emptyInProgressColumn : d.emptyPendingAcceptance}
              orders={pending}
              allOrdersInColumn={pendingAll}
              visibleLimit={visibleLimit}
              scrollable={scrollable}
              compactCards={compactCards}
              summaryMode={isSummaryMode}
              onViewAll={
                visibleLimit != null && pendingAll.length > visibleLimit
                  ? () => setDrawerColumn('pending')
                  : undefined
              }
              onViewDetail={onViewDetail}
              onPrepare={onPrepare}
              onConfirmCell={onConfirmCell}
            />

            <ProductionKanbanColumn
              icon={Factory}
              title={d.colInProduction}
              hint={d.productionKanbanInProductionHint}
              count={inProductionCount}
              emptyMessage={isCompletedView ? d.emptyCompleted : d.emptyInProduction}
              orders={inProduction}
              allOrdersInColumn={isCompletedView ? completedAll : inProductionAll}
              completedOrders={showCompletedInProduction ? completed : []}
              showCompletedSection={showCompletedInProduction && completed.length > 0}
              visibleLimit={visibleLimit}
              scrollable={scrollable}
              compactCards={compactCards}
              summaryMode={isSummaryMode}
              onViewAll={
                visibleLimit != null &&
                (isCompletedView ? completedAll.length : inProductionAll.length) > visibleLimit
                  ? () => setDrawerColumn(isCompletedView ? 'completed' : 'in_production')
                  : undefined
              }
              onViewAllCompleted={
                visibleLimit != null && completedAll.length > visibleLimit
                  ? () => setDrawerColumn('completed')
                  : undefined
              }
              onViewDetail={onViewDetail}
              onConfirmCell={onConfirmCell}
              onWithdraw={onWithdraw}
            />
          </div>
        </div>
      )}

      {drawerConfig && (
        <BacklogColumnDrawer
          title={drawerConfig.title}
          orders={drawerConfig.orders}
          completed={drawerConfig.completed}
          onClose={() => setDrawerColumn(null)}
          onViewDetail={onViewDetail}
          onPrepare={onPrepare}
          onConfirmRecipe={onConfirmCell}
          onWithdraw={onWithdraw}
        />
      )}
    </section>
  )
}
