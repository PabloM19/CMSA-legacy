import { useCallback, useState } from 'react'
import { computeKpis, loadBacklogOrders, saveBacklogOrders } from '../../data/mockBacklogOrders'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { BacklogColumnId, BacklogOrder } from '../../types/backlog'
import { canActOnOrder } from '../../utils/dashboardPermissions'
import { applyColumnMove, evaluateMove } from '../../utils/backlogRules'
import { BacklogBoard } from './components/BacklogBoard'
import { BacklogKpis } from './components/BacklogKpis'
import { BacklogToast } from './components/BacklogToast'
import { OrderDetailModal } from './components/OrderDetailModal'
import './backlog.css'

interface ConfirmState {
  type: 'incident' | 'cancel'
  order: BacklogOrder
}

export function BacklogPage() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.backlog

  const [orders, setOrders] = useState<BacklogOrder[]>(() => loadBacklogOrders())
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [detailOrder, setDetailOrder] = useState<BacklogOrder | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'info'
  } | null>(null)

  const persist = useCallback((next: BacklogOrder[]) => {
    setOrders(next)
    saveBacklogOrders(next)
  }, [])

  const showToast = useCallback(
    (message: string, type: 'error' | 'success' | 'info' = 'info') => {
      setToast({ message, type })
    },
    [],
  )

  function moveOrderToColumn(order: BacklogOrder, targetColumn: BacklogColumnId) {
    if (!user) return
    const result = evaluateMove(user, order, targetColumn, lang)
    if (!result.ok) {
      showToast(result.message ?? '', result.toastType ?? 'error')
      return
    }
    const moved = applyColumnMove(order, targetColumn, user.name)
    persist(orders.map((o) => (o.id === order.id ? moved : o)))
    if (result.message) showToast(result.message, result.toastType ?? 'success')
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
    const entry = {
      id: `audit-${Date.now()}`,
      action: lang === 'es' ? 'Mesas validadas' : 'Tables validated',
      timestamp: new Date().toISOString(),
      user: user.name,
    }
    persist(
      orders.map((o) =>
        o.id === order.id
          ? { ...o, tablesValidated: true, auditTrail: [...o.auditTrail, entry] }
          : o,
      ),
    )
    showToast(d.tablesValidated, 'success')
  }

  function handleMarkIncident(order: BacklogOrder) {
    setConfirm({ type: 'incident', order })
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
      const moved = applyColumnMove(order, 'bloqueado', user.name)
      persist(orders.map((o) => (o.id === order.id ? moved : o)))
    } else {
      const moved = applyColumnMove(
        { ...order, alerts: [...order.alerts, lang === 'es' ? 'Anulado' : 'Cancelled'] },
        'bloqueado',
        user.name,
      )
      persist(orders.map((o) => (o.id === order.id ? moved : o)))
    }
    setConfirm(null)
  }

  const kpis = computeKpis(orders)

  return (
    <div className="backlog-page">
      <header className="backlog-page__header">
        <h1 className="backlog-page__title">{d.title}</h1>
        <p className="backlog-page__subtitle">{d.subtitle}</p>
      </header>

      <BacklogKpis counts={kpis} />

      <BacklogBoard
        orders={orders}
        activeDragId={activeDragId}
        onDragStart={setActiveDragId}
        onOrdersChange={persist}
        onToast={showToast}
        onConfirmIncident={handleMarkIncident}
        onViewDetail={setDetailOrder}
        onSendValidation={handleSendValidation}
        onMarkIncident={handleMarkIncident}
        onCancel={handleCancel}
        onValidateTables={handleValidateTables}
      />

      <BacklogToast
        message={toast?.message ?? null}
        type={toast?.type}
        onClear={() => setToast(null)}
      />

      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}

      {confirm && (
        <div className="order-modal-overlay" role="presentation">
          <div className="order-modal backlog-confirm" role="alertdialog" aria-modal="true">
            <p className="backlog-confirm__text">
              {confirm.type === 'incident' ? d.confirmIncident : d.confirmCancel}
            </p>
            <div className="order-modal__actions">
              <button
                type="button"
                className="order-btn order-btn--ghost"
                onClick={() => setConfirm(null)}
              >
                {d.cancel}
              </button>
              <button type="button" className="order-btn order-btn--primary" onClick={handleConfirm}>
                {d.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
