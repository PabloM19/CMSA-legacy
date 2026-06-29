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
import {
  logAllTablesValidated,
  logTableConflict,
  logTableConflictResolved,
  logTableValidated,
} from '../../utils/activityLogActions'
import { filterValidationOrders } from '../../utils/validationViewHelpers'
import { ValidationConfirmModal } from './components/ValidationConfirmModal'
import {
  ValidationDetailPanel,
  ValidationDetailPlaceholder,
} from './components/ValidationDetailPanel'
import { ValidationFilterChips } from './components/ValidationFilterChips'
import { ValidationHero } from './components/ValidationHero'
import { ValidationLayoutSkeleton } from './components/ValidationLayoutSkeleton'
import { ValidationOrderCard } from './components/ValidationOrderCard'
import { useValidationView } from './hooks/useValidationView'
import '../dashboard/dashboard.css'
import './validation.css'

type ConfirmAction =
  | { type: 'validateAll'; orderId: string }
  | { type: 'startProduction'; orderId: string }
  | { type: 'conflict'; orderId: string; tableId: string }
  | { type: 'resolveConflict'; orderId: string; tableId: string }

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

  const { filter, isLoading, changeFilter, triggerSkeleton } = useValidationView()

  const pendingOrders = useMemo(() => getPendingValidationOrders(orders), [orders])
  const filteredOrders = useMemo(
    () => filterValidationOrders(pendingOrders, filter),
    [pendingOrders, filter],
  )
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

  function handleSelectOrder(orderId: string) {
    triggerSkeleton(() => setSelectedOrderId(orderId))
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
    const table = selectedOrder.validationTables?.find((t) => t.id === tableId)
    if (table) {
      logTableValidated(user, selectedOrder.reference, table.name)
    }
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

  function handleResolveConflictRequest(tableId: string) {
    if (!selectedOrder || !guardAction()) return
    setConfirm({ type: 'resolveConflict', orderId: selectedOrder.id, tableId })
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
      logAllTablesValidated(user, order.reference)
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
      const table = order.validationTables?.find((t) => t.id === confirm.tableId)
      if (table) {
        logTableConflict(user, order.reference, table.name)
      }
      showToast(d.conflictNotice, 'info')
    }

    if (confirm.type === 'resolveConflict') {
      const { order: updated, plantTables: nextPlant } = resolveTableConflict(
        order,
        confirm.tableId,
        user.name,
        lang,
        plantTables,
      )
      persist(
        orders.map((o) => (o.id === order.id ? updated : o)),
        nextPlant,
      )
      const table = order.validationTables?.find((t) => t.id === confirm.tableId)
      if (table) {
        logTableConflictResolved(user, order.reference, table.name)
      }
      showToast(d.conflictResolved, 'success')
    }

    if (confirm.type === 'startProduction') {
      const moveResult = executeColumnMove(
        orders,
        plantTables,
        order,
        'en_ejecucion',
        user,
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
    if (confirm.type === 'resolveConflict') return d.confirmResolveConflict
    return d.confirmConflict
  }

  function confirmDanger(): boolean {
    return confirm?.type === 'conflict'
  }

  if (!user) return null

  return (
    <div className="validation-page">
      <PageHeader
        title={d.title}
        description={d.subtitle}
        showMockBadge
        badgeLabel={d.simulatedBadge}
      />

      <ValidationHero counts={kpis} />

      {isLoading ? (
        <ValidationLayoutSkeleton />
      ) : (
        <div className="validation-layout">
          <section className="validation-list">
            <ValidationFilterChips active={filter} onChange={changeFilter} />

            {pendingOrders.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck size={28} strokeWidth={1.5} />}
                title={d.emptyTitle}
                description={d.emptySubtitle}
              />
            ) : filteredOrders.length === 0 ? (
              <EmptyState title={d.filterEmpty} description={d.filterEmptyHint} />
            ) : (
              <div className="validation-list__items">
                {filteredOrders.map((order) => (
                  <ValidationOrderCard
                    key={order.id}
                    order={order}
                    selected={order.id === selectedOrderId}
                    onSelect={(item) => handleSelectOrder(item.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="validation-panel">
            {selectedOrder ? (
              <ValidationDetailPanel
                order={selectedOrder}
                user={user}
                onValidateTable={handleValidateTable}
                onValidateAll={handleValidateAllRequest}
                onMarkConflict={handleMarkConflictRequest}
                onResolveConflict={handleResolveConflictRequest}
                onStartProduction={handleStartProductionRequest}
              />
            ) : (
              <ValidationDetailPlaceholder />
            )}
          </aside>
        </div>
      )}

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
          danger={confirmDanger()}
        />
      )}
    </div>
  )
}
