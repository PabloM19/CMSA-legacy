import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ClipboardList, Factory } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import { isInProductionColumn, isPendingAcceptanceColumn } from '../../../utils/dailyOrderHelpers'
import { resolveVisibleLimit } from '../../../utils/backlogViewPrefs'
import { useBacklogView } from '../hooks/useBacklogView'
import { BacklogBoardSkeleton } from './BacklogBoardSkeleton'
import { BacklogColumnDrawer } from './BacklogColumnDrawer'
import { BacklogOrderCard } from './BacklogOrderCard'
import { BacklogViewControls } from './BacklogViewControls'

type ProductionDrawerColumn = 'pending' | 'in_production'

interface ProductionOrdersPanelProps {
  orders: BacklogOrder[]
  onViewDetail: (order: BacklogOrder) => void
  onPrepare?: (order: BacklogOrder) => void
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
  visibleLimit: number | null
  scrollable: boolean
  compactCards: boolean
  summaryMode: boolean
  onViewAll?: () => void
  onViewDetail: (order: BacklogOrder) => void
  onPrepare?: (order: BacklogOrder) => void
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
  visibleLimit,
  scrollable,
  compactCards,
  summaryMode,
  onViewAll,
  onViewDetail,
  onPrepare,
  onWithdraw,
}: KanbanColumnProps) {
  const { t } = useLanguage()
  const d = t.backlog

  const displayOrders = visibleLimit != null ? orders.slice(0, visibleLimit) : orders
  const hiddenCount = allOrdersInColumn.length - displayOrders.length
  const showMoreFooter = visibleLimit != null && hiddenCount > 0 && onViewAll
  const isEmpty = count === 0

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
            onViewDetail={onViewDetail}
            onPrepare={onPrepare}
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
      </div>
    </section>
  )
}

function isVisibleProductionOrder(order: BacklogOrder): boolean {
  return order.column !== 'finalizado'
}

export function ProductionOrdersPanel({
  orders,
  onViewDetail,
  onPrepare,
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

  const activeOrders = useMemo(
    () => orders.filter(isVisibleProductionOrder),
    [orders],
  )

  const pendingAll = useMemo(
    () => activeOrders.filter(isPendingAcceptanceColumn).sort((a, b) => a.priority - b.priority),
    [activeOrders],
  )
  const inProductionAll = useMemo(
    () => activeOrders.filter(isInProductionColumn).sort((a, b) => a.priority - b.priority),
    [activeOrders],
  )

  const visibleLimit = resolveVisibleLimit(viewMode, density)
  const scrollable = viewMode === 'full'
  const compactCards = viewMode !== 'full'
  const isSummaryMode = viewMode === 'summary'

  const drawerConfig = useMemo(() => {
    if (!drawerColumn) return null
    if (drawerColumn === 'pending') {
      return {
        title: d.colPendingAcceptance,
        orders: pendingAll,
      }
    }
    return {
      title: d.colInProduction,
      orders: inProductionAll,
    }
  }, [drawerColumn, d, pendingAll, inProductionAll])

  return (
    <section className="production-orders" aria-label={p.title}>
      <BacklogViewControls
        viewMode={viewMode}
        density={density}
        densityDisabled={densityDisabled}
        onViewModeChange={changeViewMode}
        onDensityChange={changeDensity}
        modes={['summary', 'full']}
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
              count={pendingAll.length}
              emptyMessage={d.emptyPendingAcceptance}
              orders={pendingAll}
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
            />

            <ProductionKanbanColumn
              icon={Factory}
              title={d.colInProduction}
              hint={d.productionKanbanInProductionHint}
              count={inProductionAll.length}
              emptyMessage={d.emptyInProduction}
              orders={inProductionAll}
              allOrdersInColumn={inProductionAll}
              visibleLimit={visibleLimit}
              scrollable={scrollable}
              compactCards={compactCards}
              summaryMode={isSummaryMode}
              onViewAll={
                visibleLimit != null && inProductionAll.length > visibleLimit
                  ? () => setDrawerColumn('in_production')
                  : undefined
              }
              onViewDetail={onViewDetail}
              onWithdraw={onWithdraw}
            />
          </div>
        </div>
      )}

      {drawerConfig && (
        <BacklogColumnDrawer
          title={drawerConfig.title}
          orders={drawerConfig.orders}
          onClose={() => setDrawerColumn(null)}
          onViewDetail={onViewDetail}
          onPrepare={onPrepare}
          onWithdraw={onWithdraw}
        />
      )}
    </section>
  )
}
