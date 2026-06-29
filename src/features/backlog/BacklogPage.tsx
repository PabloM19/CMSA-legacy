import { useCallback, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { computeKpis } from '../../data/mockBacklogOrders'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { BacklogColumnId, BacklogOrder } from '../../types/backlog'
import type { PlantTable } from '../../types/plant'
import { canActOnOrder } from '../../utils/dashboardPermissions'
import { evaluateMove } from '../../utils/backlogRules'
import { executeColumnMove } from '../../utils/backlogMove'
import { getState, saveOrdersAndPlant } from '../../utils/backlogStorage'
import { demoValidateAllTables } from '../../utils/validationHelpers'
import { logAllTablesValidated } from '../../utils/activityLogActions'
import { BacklogBoard } from './components/BacklogBoard'
import { BacklogBoardSkeleton } from './components/BacklogBoardSkeleton'
import { BacklogHelpNote } from './components/BacklogHelpNote'
import { BacklogHero } from './components/BacklogHero'
import { BacklogQuickActions } from './components/BacklogQuickActions'
import { BacklogToast } from './components/BacklogToast'
import { BacklogViewControls } from './components/BacklogViewControls'
import { OrderDetailModal } from './components/OrderDetailModal'
import { useBacklogView } from './hooks/useBacklogView'
import '../dashboard/dashboard.css'
import './backlog.css'

interface ConfirmState {
  type: 'incident' | 'cancel' | 'finalize'
  order: BacklogOrder
}

export function BacklogPage() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.backlog

  const [orders, setOrders] = useState<BacklogOrder[]>(() => getState().orders)
  const [plantTables, setPlantTables] = useState<PlantTable[]>(() => getState().plantTables)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [detailOrder, setDetailOrder] = useState<BacklogOrder | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'info'
  } | null>(null)

  const persist = useCallback((nextOrders: BacklogOrder[], nextPlant: PlantTable[]) => {
    setOrders(nextOrders)
    setPlantTables(nextPlant)
    saveOrdersAndPlant(nextOrders, nextPlant)
  }, [])

  const showToast = useCallback(
    (message: string, type: 'error' | 'success' | 'info' = 'info') => {
      setToast({ message, type })
    },
    [],
  )

  function applyMove(order: BacklogOrder, targetColumn: BacklogColumnId) {
    if (!user) return false

    const result = executeColumnMove(orders, plantTables, order, targetColumn, user, lang)
    if (!result.success) {
      showToast(result.message ?? t.validation.insufficientTables, 'error')
      return false
    }

    persist(result.orders, result.plantTables)
    return true
  }

  function moveOrderToColumn(order: BacklogOrder, targetColumn: BacklogColumnId) {
    if (!user) return
    const evalResult = evaluateMove(user, order, targetColumn, lang)
    if (evalResult.needsConfirm && evalResult.confirmAction === 'finalize') {
      setConfirm({ type: 'finalize', order })
      return
    }
    if (!evalResult.ok) {
      showToast(evalResult.message ?? '', evalResult.toastType ?? 'error')
      return
    }
    if (applyMove(order, targetColumn) && evalResult.message) {
      showToast(evalResult.message, evalResult.toastType ?? 'success')
    }
  }

  function handleSendValidation(order: BacklogOrder) {
    moveOrderToColumn(order, 'pendiente_validacion')
  }

  function handleValidateTables(order: BacklogOrder) {
    if (!user || !canActOnOrder(user, order.company)) {
      showToast(
        lang === 'es'
          ? 'No puedes actuar sobre pedidos de otra empresa.'
          : 'You cannot act on another company’s orders.',
        'error',
      )
      return
    }
    const updated = demoValidateAllTables(order, user.name, lang)
    logAllTablesValidated(user, order.reference)
    persist(
      orders.map((o) => (o.id === order.id ? updated : o)),
      plantTables,
    )
    showToast(d.tablesValidated, 'success')
    setDetailOrder((current) => (current?.id === order.id ? updated : current))
  }

  function handleMarkIncident(order: BacklogOrder) {
    setConfirm({ type: 'incident', order })
  }

  function handleConfirmFinalize(order: BacklogOrder) {
    setConfirm({ type: 'finalize', order })
  }

  function handleCancel(order: BacklogOrder) {
    if (user?.role !== 'master') {
      showToast(
        lang === 'es'
          ? 'Solo un usuario máster puede anular pedidos aceptados.'
          : 'Only a master user can cancel accepted orders.',
        'error',
      )
      return
    }
    setConfirm({ type: 'cancel', order })
  }

  function handleConfirm() {
    if (!confirm || !user) return
    const { order, type } = confirm
    if (type === 'incident') {
      applyMove(order, 'bloqueado')
    } else if (type === 'finalize') {
      applyMove(order, 'finalizado')
    } else {
      const withAlert = {
        ...order,
        alerts: [...order.alerts, lang === 'es' ? 'Anulado' : 'Cancelled'],
      }
      applyMove(withAlert, 'bloqueado')
    }
    setConfirm(null)
    setDetailOrder(null)
  }

  function confirmMessage(): string {
    if (!confirm) return ''
    if (confirm.type === 'incident') return d.confirmIncident
    if (confirm.type === 'finalize') return d.confirmFinalize
    return d.confirmCancel
  }

  function handleRefresh() {
    const state = getState()
    persist(state.orders, state.plantTables)
    showToast(d.refreshed, 'info')
  }

  const kpis = computeKpis(orders)
  const {
    viewMode,
    density,
    isLoading,
    changeViewMode,
    changeDensity,
    densityDisabled,
  } = useBacklogView()

  return (
    <div className="backlog-page">
      <PageHeader
        title={d.title}
        description={d.subtitle}
        showMockBadge
        badgeLabel={d.simulatedBadge}
      />

      <BacklogHero counts={kpis} />

      <BacklogQuickActions onRefresh={handleRefresh} />

      <BacklogHelpNote />

      <BacklogViewControls
        viewMode={viewMode}
        density={density}
        densityDisabled={densityDisabled}
        onViewModeChange={changeViewMode}
        onDensityChange={changeDensity}
      />

      {isLoading ? (
        <BacklogBoardSkeleton />
      ) : (
        <BacklogBoard
          orders={orders}
          plantTables={plantTables}
          activeDragId={activeDragId}
          viewMode={viewMode}
          density={density}
          onDragStart={setActiveDragId}
          onOrdersChange={persist}
          onToast={showToast}
          onConfirmIncident={handleMarkIncident}
          onConfirmFinalize={handleConfirmFinalize}
          onViewDetail={setDetailOrder}
          onSendValidation={handleSendValidation}
          onMarkIncident={handleMarkIncident}
          onCancel={handleCancel}
          onValidateTables={handleValidateTables}
        />
      )}

      <BacklogToast
        message={toast?.message ?? null}
        type={toast?.type}
        onClear={() => setToast(null)}
      />

      {detailOrder && user && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onMarkIncident={
            user.role === 'master' && detailOrder.column !== 'bloqueado'
              ? () => handleMarkIncident(detailOrder)
              : undefined
          }
          onCancel={
            user.role === 'master' && detailOrder.column !== 'finalizado'
              ? () => handleCancel(detailOrder)
              : undefined
          }
          onValidateTables={
            canActOnOrder(user, detailOrder.company) &&
            detailOrder.column === 'pendiente_validacion' &&
            !detailOrder.tablesValidated
              ? () => handleValidateTables(detailOrder)
              : undefined
          }
        />
      )}

      {confirm && (
        <ConfirmModal
          title={d.confirmModalTitle}
          description={confirmMessage()}
          confirmLabel={d.confirm}
          cancelLabel={d.cancel}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
          danger={confirm.type === 'incident' || confirm.type === 'cancel'}
        />
      )}
    </div>
  )
}
