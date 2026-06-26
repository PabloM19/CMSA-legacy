import { useCallback, useMemo, useState } from 'react'
import { BacklogToast } from '../backlog/components/BacklogToast'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { BacklogOrder } from '../../types/backlog'
import { applyColumnMove } from '../../utils/backlogRules'
import { getOrders, saveOrders } from '../../utils/backlogStorage'
import { canPerformValidation } from '../../utils/permissions'
import {
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

  const [orders, setOrders] = useState<BacklogOrder[]>(() => getOrders())
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'info'
  } | null>(null)

  const pendingOrders = useMemo(() => getPendingValidationOrders(orders), [orders])
  const kpis = useMemo(() => computeValidationKpis(orders), [orders])
  const selectedOrder = pendingOrders.find((o) => o.id === selectedOrderId) ?? null

  const persist = useCallback((next: BacklogOrder[]) => {
    saveOrders(next)
    setOrders(next)
  }, [])

  const showToast = useCallback(
    (message: string, type: 'error' | 'success' | 'info' = 'info') => {
      setToast({ message, type })
    },
    [],
  )

  function updateOrder(orderId: string, updater: (order: BacklogOrder) => BacklogOrder) {
    persist(orders.map((o) => (o.id === orderId ? updater(o) : o)))
  }

  function guardAction(): boolean {
    if (!user || !canPerformValidation(user)) {
      showToast(d.actionDenied, 'error')
      return false
    }
    return true
  }

  function handleValidateTable(tableId: string) {
    if (!user || !selectedOrder || !guardAction()) return
    updateOrder(selectedOrder.id, (order) =>
      validateSingleTable(order, tableId, user.name, lang),
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
    updateOrder(selectedOrder.id, (order) =>
      resolveTableConflict(order, tableId, user.name, lang),
    )
    showToast(d.conflictResolved, 'success')
  }

  function handleStartProductionRequest() {
    if (!selectedOrder || !guardAction()) return
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
      updateOrder(order.id, (current) => validateAllTables(current, user.name, lang))
      showToast(d.allTablesValidated, 'success')
    }

    if (confirm.type === 'conflict') {
      updateOrder(order.id, (current) =>
        markTableConflict(
          current,
          confirm.tableId,
          d.mockConflictReason,
          user.name,
          lang,
        ),
      )
      showToast(d.conflictNotice, 'info')
    }

    if (confirm.type === 'startProduction') {
      const moved = applyColumnMove(order, 'en_ejecucion', user.name)
      moved.auditTrail = [
        ...moved.auditTrail,
        {
          id: `audit-${Date.now()}`,
          action: lang === 'es' ? 'Pedido iniciado en producción.' : 'Order started in production.',
          timestamp: new Date().toISOString(),
          user: user.name,
        },
      ]
      persist(orders.map((o) => (o.id === order.id ? moved : o)))
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
      <header className="validation-page__header">
        <h1 className="validation-page__title">{d.title}</h1>
        <p className="validation-page__subtitle">{d.subtitle}</p>
      </header>

      <ValidationKpis counts={kpis} />

      <div className="validation-layout">
        <section className="validation-list">
          <h2 className="validation-list__title">{d.kpiPendingOrders}</h2>

          {pendingOrders.length === 0 ? (
            <div className="validation-empty">
              <p className="validation-empty__title">{d.emptyTitle}</p>
              <p className="validation-empty__subtitle">{d.emptySubtitle}</p>
            </div>
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
