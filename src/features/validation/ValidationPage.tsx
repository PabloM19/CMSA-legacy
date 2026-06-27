import { useCallback, useMemo, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { BacklogToast } from '../backlog/components/BacklogToast'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { BacklogOrder } from '../../types/backlog'
import type { PlantTable } from '../../types/plant'
import { executeColumnMove } from '../../utils/backlogMove'
import { getState, saveOrdersAndPlant } from '../../utils/backlogStorage'
import { canPerformValidation } from '../../utils/permissions'
import {
  canStartProduction,
  computeValidationKpis,
  getPendingValidationOrders,
  markTableConflict,
  resolveTableConflict,
  validateAllTables,
  validateSingleTable,
} from '../../utils/validationHelpers'
import { ValidationConfirmModal } from './components/ValidationConfirmModal'
import { ValidationDetailPanel } from './components/ValidationDetailPanel'
import { ValidationKpis } from './components/ValidationKpis'
import { ValidationOrderCard } from './components/ValidationOrderCard'
import './validation.css'

type ConfirmAction =
  | { type: 'validateAll'; orderId: string }
  | { type: 'startProduction'; orderId: string }
  | { type: 'conflict'; orderId: string; tableId: string }

export function ValidationPage() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.validation

  const [orders, setOrders] = useState<BacklogOrder[]>(() => getState().orders)
  const [plantTables, setPlantTables] = useState<PlantTable[]>(() => getState().plantTables)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'info'
  } | null>(null)

  const pendingOrders = useMemo(() => getPendingValidationOrders(orders), [orders])
  const kpis = useMemo(() => computeValidationKpis(orders), [orders])
  const selectedOrder = pendingOrders.find((o) => o.id === selectedOrderId) ?? null

  const persist = useCallback((nextOrders: BacklogOrder[], nextPlant: PlantTable[]) => {
    saveOrdersAndPlant(nextOrders, nextPlant)
    setOrders(nextOrders)
    setPlantTables(nextPlant)
  }, [])

  const showToast = useCallback(
    (message: string, type: 'error' | 'success' | 'info' = 'info') => {
      setToast({ message, type })
    },
    [],
  )

  function guardAction(): boolean {
    if (!user || !canPerformValidation(user)) {
      showToast(d.actionDenied, 'error')
      return false
    }
    return true
  }

  function handleValidateTable(tableId: string) {
    if (!user || !selectedOrder || !guardAction()) return
    const { order, plantTables: nextPlant } = validateSingleTable(
      selectedOrder,
      tableId,
      user.name,
      lang,
      plantTables,
    )
    persist(
      orders.map((o) => (o.id === selectedOrder.id ? order : o)),
      nextPlant,
    )
    showToast(d.tableValidated, 'success')
  }

  function handleValidateAllRequest() {
    if (!selectedOrder || !guardAction()) return
    setConfirm({ type: 'validateAll', orderId: selectedOrder.id })
  }

  function handleMarkConflictRequest(tableId: string) {
    if (!selectedOrder || !guardAction()) return
    setConfirm({ type: 'conflict', orderId: selectedOrder.id, tableId })
  }

  function handleResolveConflict(tableId: string) {
    if (!user || !selectedOrder || !guardAction()) return
    const { order, plantTables: nextPlant } = resolveTableConflict(
      selectedOrder,
      tableId,
      user.name,
      lang,
      plantTables,
    )
    persist(
      orders.map((o) => (o.id === selectedOrder.id ? order : o)),
      nextPlant,
    )
    showToast(d.conflictResolved, 'success')
  }

  function handleStartProductionRequest() {
    if (!selectedOrder || !guardAction()) return
    if (!canStartProduction(selectedOrder)) {
      showToast(d.cannotStartNotice, 'error')
      return
    }
    setConfirm({ type: 'startProduction', orderId: selectedOrder.id })
  }

  function handleConfirm() {
    if (!confirm || !user) return

    const order = orders.find((o) => o.id === confirm.orderId)
    if (!order) {
      setConfirm(null)
      return
    }

    if (confirm.type === 'validateAll') {
      const { order: updated, plantTables: nextPlant } = validateAllTables(
        order,
        user.name,
        lang,
        plantTables,
      )
      persist(
        orders.map((o) => (o.id === order.id ? updated : o)),
        nextPlant,
      )
      showToast(d.allTablesValidated, 'success')
    }

    if (confirm.type === 'conflict') {
      const { order: updated, plantTables: nextPlant } = markTableConflict(
        order,
        confirm.tableId,
        d.mockConflictReason,
        user.name,
        lang,
        plantTables,
      )
      persist(
        orders.map((o) => (o.id === order.id ? updated : o)),
        nextPlant,
      )
      showToast(d.conflictNotice, 'info')
    }

    if (confirm.type === 'startProduction') {
      const moveResult = executeColumnMove(
        orders,
        plantTables,
        order,
        'en_ejecucion',
        user.name,
        lang,
      )
      if (!moveResult.success) {
        showToast(moveResult.message ?? d.cannotStartNotice, 'error')
        setConfirm(null)
        return
      }
      const moved = moveResult.movedOrder!
      moved.auditTrail = [
        ...moved.auditTrail,
        {
          id: `audit-${Date.now()}`,
          action: lang === 'es' ? 'Pedido iniciado en producción.' : 'Order started in production.',
          timestamp: new Date().toISOString(),
          user: user.name,
        },
      ]
      persist(
        moveResult.orders.map((o) => (o.id === order.id ? moved : o)),
        moveResult.plantTables,
      )
      setSelectedOrderId(null)
      showToast(d.productionStarted, 'success')
    }

    setConfirm(null)
  }

  function confirmMessage(): string {
    if (!confirm) return ''
    if (confirm.type === 'validateAll') return d.confirmValidateAll
    if (confirm.type === 'startProduction') return d.confirmStartProduction
    return d.confirmConflict
  }

  if (!user) return null

  return (
    <div className="validation-page">
      <PageHeader title={d.title} description={d.subtitle} showMockBadge />

      <ValidationKpis counts={kpis} />

      <div className="validation-layout">
        <section className="validation-list">
          <h2 className="validation-list__title">{d.kpiPendingOrders}</h2>

          {pendingOrders.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck size={28} strokeWidth={1.5} />}
              title={d.emptyTitle}
              description={d.emptySubtitle}
            />
          ) : (
            <div className="validation-list__items">
              {pendingOrders.map((order) => (
                <ValidationOrderCard
                  key={order.id}
                  order={order}
                  selected={order.id === selectedOrderId}
                  onSelect={(item) => setSelectedOrderId(item.id)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="validation-panel">
          {selectedOrder && user ? (
            <ValidationDetailPanel
              order={selectedOrder}
              user={user}
              onValidateTable={handleValidateTable}
              onValidateAll={handleValidateAllRequest}
              onMarkConflict={handleMarkConflictRequest}
              onResolveConflict={handleResolveConflict}
              onStartProduction={handleStartProductionRequest}
            />
          ) : (
            <div className="validation-panel__placeholder">
              <p>{d.selectOrder}</p>
            </div>
          )}
        </aside>
      </div>

      <BacklogToast
        message={toast?.message ?? null}
        type={toast?.type}
        onClear={() => setToast(null)}
      />

      {confirm && (
        <ValidationConfirmModal
          message={confirmMessage()}
          confirmLabel={d.confirm}
          cancelLabel={d.cancel}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
