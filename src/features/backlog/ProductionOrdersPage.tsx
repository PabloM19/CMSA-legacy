import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListOrdered, RefreshCw } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { BacklogOrder } from '../../types/backlog'
import type { DailyOrder } from '../../types/dailyOrder'
import type { PlantTable } from '../../types/plant'
import { getState, saveOrdersAndPlant } from '../../utils/backlogStorage'
import { applyWithdrawToDailyOrder } from '../../utils/dailyOrderOperations'
import { canWithdrawProduction } from '../../utils/permissions'
import { logOrderWithdrawn } from '../../utils/activityLogActions'
import { confirmRecipeForOrder } from '../../utils/preparationHelpers'
import { withdrawOrderFromProduction, type WithdrawReason } from '../../utils/withdrawProduction'
import { ProductionOrdersPanel } from './components/ProductionOrdersPanel'
import { BacklogToast } from './components/BacklogToast'
import { OrderDetailModal } from './components/OrderDetailModal'
import { WithdrawProductionModal } from './components/WithdrawProductionModal'
import { PrepareObjectiveModal } from './components/PrepareObjectiveModal'
import '../dashboard/dashboard.css'
import './backlog.css'
import '../admin/admin.css'

export function ProductionOrdersPage() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.productionOrdersPage
  const b = t.backlog

  const [dailyOrders, setDailyOrders] = useState<DailyOrder[]>(() => getState().dailyOrders)
  const [orders, setOrders] = useState<BacklogOrder[]>(() => getState().orders)
  const [plantTables, setPlantTables] = useState<PlantTable[]>(() => getState().plantTables)
  const [detailOrder, setDetailOrder] = useState<BacklogOrder | null>(null)
  const [withdrawOrder, setWithdrawOrder] = useState<BacklogOrder | null>(null)
  const [prepareOrder, setPrepareOrder] = useState<BacklogOrder | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'info'
  } | null>(null)

  const persist = useCallback(
    (nextOrders: BacklogOrder[], nextPlant: PlantTable[], nextDaily?: DailyOrder[]) => {
      setOrders(nextOrders)
      setPlantTables(nextPlant)
      if (nextDaily) setDailyOrders(nextDaily)
      saveOrdersAndPlant(nextOrders, nextPlant, nextDaily)
    },
    [],
  )

  const showToast = useCallback(
    (message: string, type: 'error' | 'success' | 'info' = 'info') => {
      setToast({ message, type })
    },
    [],
  )

  function handleWithdrawConfirm(reason: WithdrawReason, comment: string) {
    if (!user || !withdrawOrder) return
    if (!comment.trim()) {
      showToast(b.withdrawCommentRequired, 'error')
      return
    }
    const REASON_LABELS_ES: Record<WithdrawReason, string> = {
      incident: 'Incidencia operativa',
      reference_error: 'Error de referencia',
      supervisor_decision: 'Decisión de supervisor',
      other: 'Otro',
    }
    const REASON_LABELS_EN: Record<WithdrawReason, string> = {
      incident: 'Operational incident',
      reference_error: 'Reference error',
      supervisor_decision: 'Supervisor decision',
      other: 'Other',
    }
    const labels = lang === 'es' ? REASON_LABELS_ES : REASON_LABELS_EN
    const fullReason = `${labels[reason]} — ${comment.trim()}`
    const produced = Math.round(withdrawOrder.boxes * 0.35)
    const result = withdrawOrderFromProduction(
      orders,
      plantTables,
      withdrawOrder.id,
      fullReason,
      user.name,
      produced,
    )
    const nextDaily = applyWithdrawToDailyOrder(
      dailyOrders,
      result.orders,
      withdrawOrder.id,
      produced,
      user,
    )
    persist(result.orders, result.plantTables, nextDaily)
    logOrderWithdrawn(user, withdrawOrder.reference, fullReason)
    setWithdrawOrder(null)
    setDetailOrder(null)
    showToast(b.withdrawSuccess, 'success')
  }

  function handlePrepareConfirm(nextOrder: BacklogOrder, nextPlant: PlantTable[]) {
    const nextOrders = orders.map((o) => (o.id === nextOrder.id ? nextOrder : o))
    persist(nextOrders, nextPlant)
    setPrepareOrder(null)
    showToast(b.prepareSuccess, 'success')
  }

  function handleConfirmCell(order: BacklogOrder) {
    if (!user) return
    const result = confirmRecipeForOrder(order, plantTables, user.name)
    const nextOrders = orders.map((o) => (o.id === order.id ? result.order : o))
    persist(nextOrders, result.plantTables)
    showToast(b.confirmRecipeSuccess, 'success')
  }

  function handleRefresh() {
    const state = getState()
    setDailyOrders(state.dailyOrders)
    persist(state.orders, state.plantTables, state.dailyOrders)
    showToast(b.refreshed, 'info')
  }

  return (
    <div className="backlog-page">
      <PageHeader
        title={d.title}
        description={d.subtitle}
        showMockBadge
        badgeLabel={b.simulatedBadge}
      />

      {user && (
        <section className="dash-quick">
          <h2 className="dash-quick__title">{b.quickActionsTitle}</h2>
          <div className="dash-quick__grid">
            <Link to="/daily-orders" className="dash-quick__btn">
              <span className="dash-quick__btn-icon">
                <ListOrdered size={24} strokeWidth={1.75} />
              </span>
              <span className="dash-quick__btn-label">{d.goDailyOrders}</span>
              <span className="dash-quick__btn-hint">{d.goDailyOrdersHint}</span>
            </Link>
            <button type="button" className="dash-quick__btn" onClick={handleRefresh}>
              <span className="dash-quick__btn-icon">
                <RefreshCw size={24} strokeWidth={1.75} />
              </span>
              <span className="dash-quick__btn-label">{b.actionRefresh}</span>
              <span className="dash-quick__btn-hint">{b.actionRefreshHint}</span>
            </button>
          </div>
        </section>
      )}

      <ProductionOrdersPanel
        orders={orders}
        onViewDetail={setDetailOrder}
        onPrepare={setPrepareOrder}
        onConfirmCell={handleConfirmCell}
        onWithdraw={(order) => {
          if (!user || !canWithdrawProduction(user)) {
            showToast(b.noPermission, 'error')
            return
          }
          setWithdrawOrder(order)
        }}
      />

      <BacklogToast
        message={toast?.message ?? null}
        type={toast?.type}
        onClear={() => setToast(null)}
      />

      {detailOrder && user && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onWithdraw={
            canWithdrawProduction(user) && detailOrder.column === 'en_produccion'
              ? () => setWithdrawOrder(detailOrder)
              : undefined
          }
        />
      )}

      {withdrawOrder && (
        <WithdrawProductionModal
          order={withdrawOrder}
          onClose={() => setWithdrawOrder(null)}
          onConfirm={handleWithdrawConfirm}
          commentRequired
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
    </div>
  )
}
