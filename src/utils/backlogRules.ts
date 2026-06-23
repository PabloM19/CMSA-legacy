import { assignMockTables } from '../data/mockBacklogOrders'
import type { Lang } from '../i18n/translations'
import type { User } from '../types/auth'
import type { BacklogColumnId, BacklogOrder } from '../types/backlog'
import { canActOnOrder } from './dashboardPermissions'

export type BacklogToastType = 'error' | 'success' | 'info'

export interface BacklogMoveResult {
  ok: boolean
  message?: string
  toastType?: BacklogToastType
  needsConfirm?: boolean
  confirmAction?: 'incident' | 'cancel'
}

const COLUMN_ORDER: BacklogColumnId[] = [
  'en_backlog',
  'pendiente_lanzamiento',
  'pendiente_validacion',
  'en_ejecucion',
  'bloqueado',
  'finalizado',
]

export function getColumnIndex(col: BacklogColumnId): number {
  return COLUMN_ORDER.indexOf(col)
}

const MAIN_FLOW: BacklogColumnId[] = [
  'en_backlog',
  'pendiente_lanzamiento',
  'pendiente_validacion',
  'en_ejecucion',
]

function isMainFlowColumn(col: BacklogColumnId): boolean {
  return MAIN_FLOW.includes(col)
}

export function isValidTransition(
  from: BacklogColumnId,
  to: BacklogColumnId,
  isMaster = false,
): boolean {
  if (from === to) return true

  // Master: puede retroceder dentro del flujo principal
  if (
    isMaster &&
    isMainFlowColumn(from) &&
    isMainFlowColumn(to) &&
    getColumnIndex(to) < getColumnIndex(from)
  ) {
    return true
  }

  // Master: recuperar pedidos desde finalizado o bloqueado al flujo principal
  if (isMaster && (from === 'finalizado' || from === 'bloqueado') && isMainFlowColumn(to)) {
    return true
  }

  const allowed: Record<BacklogColumnId, BacklogColumnId[]> = {
    en_backlog: ['pendiente_lanzamiento'],
    pendiente_lanzamiento: ['pendiente_validacion'],
    pendiente_validacion: ['en_ejecucion'],
    en_ejecucion: ['finalizado'],
    bloqueado: ['en_backlog', 'pendiente_lanzamiento'],
    finalizado: [],
  }

  return allowed[from]?.includes(to) ?? false
}

export function isBackwardMove(from: BacklogColumnId, to: BacklogColumnId): boolean {
  if (!isMainFlowColumn(from) || !isMainFlowColumn(to)) {
    if (from === 'finalizado' || from === 'bloqueado') return isMainFlowColumn(to)
    return false
  }
  return getColumnIndex(to) < getColumnIndex(from)
}

function messages(lang: Lang) {
  return lang === 'es'
    ? {
        noPermission: 'Acción no permitida para tu empresa.',
        noPermissionLong: 'No puedes actuar sobre pedidos de otra empresa.',
        needsValidation:
          'Este pedido debe pasar primero por validación de mesas.',
        sentToValidation: 'Pedido enviado a validación de mesas.',
        masterIncident: 'Solo un usuario máster puede marcar incidencias.',
        masterCancel: 'Solo un usuario máster puede anular pedidos aceptados.',
        masterFinish: 'Solo un usuario máster puede finalizar pedidos.',
        invalidTransition: 'Transición no permitida en el flujo operativo.',
        tablesNotValidated:
          'Las mesas aún no están validadas para pasar a ejecución.',
        movedBack: 'Pedido retrocedido en el backlog.',
      }
    : {
        noPermission: 'Action not allowed for your company.',
        noPermissionLong: 'You cannot act on another company’s orders.',
        needsValidation: 'This order must go through table validation first.',
        sentToValidation: 'Order sent to table validation.',
        masterIncident: 'Only a master user can mark incidents.',
        masterCancel: 'Only a master user can cancel accepted orders.',
        masterFinish: 'Only a master user can complete orders.',
        invalidTransition: 'Transition not allowed in the operational flow.',
        tablesNotValidated: 'Tables are not validated yet for execution.',
        movedBack: 'Order moved back in the backlog.',
      }
}

export function evaluateMove(
  user: User,
  order: BacklogOrder,
  targetColumn: BacklogColumnId,
  lang: Lang,
): BacklogMoveResult {
  const msg = messages(lang)

  if (!canActOnOrder(user, order.company)) {
    return { ok: false, message: msg.noPermission, toastType: 'error' }
  }

  if (order.column === targetColumn) {
    return { ok: true }
  }

  if (targetColumn === 'bloqueado') {
    if (user.role !== 'master') {
      return { ok: false, message: msg.masterIncident, toastType: 'error' }
    }
    return { ok: false, needsConfirm: true, confirmAction: 'incident' }
  }

  if (targetColumn === 'finalizado') {
    if (user.role !== 'master') {
      return { ok: false, message: msg.masterFinish, toastType: 'error' }
    }
    return { ok: true }
  }

  if (targetColumn === 'en_ejecucion') {
    if (order.column !== 'pendiente_validacion') {
      return { ok: false, message: msg.needsValidation, toastType: 'error' }
    }
    if (!order.tablesValidated) {
      return { ok: false, message: msg.tablesNotValidated, toastType: 'error' }
    }
  }

  const isMaster = user.role === 'master'

  if (!isValidTransition(order.column, targetColumn, isMaster)) {
    if (
      !isMaster &&
      getColumnIndex(targetColumn) > getColumnIndex('pendiente_validacion') &&
      order.column !== 'pendiente_validacion'
    ) {
      return { ok: false, message: msg.needsValidation, toastType: 'error' }
    }
    return { ok: false, message: msg.invalidTransition, toastType: 'error' }
  }

  if (isMaster && isBackwardMove(order.column, targetColumn)) {
    return { ok: true, message: msg.movedBack, toastType: 'info' }
  }

  if (targetColumn === 'pendiente_validacion') {
    return { ok: true, message: msg.sentToValidation, toastType: 'success' }
  }

  return { ok: true }
}

export function applyColumnMove(
  order: BacklogOrder,
  targetColumn: BacklogColumnId,
  userName: string,
): BacklogOrder {
  const updated: BacklogOrder = {
    ...order,
    column: targetColumn,
    auditTrail: [...order.auditTrail],
  }

  const entry = (action: string) => ({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    timestamp: new Date().toISOString(),
    user: userName,
  })

  if (targetColumn === 'pendiente_validacion') {
    updated.assignedTables = assignMockTables(order.requiredTables)
    updated.auditTrail.push(entry('Enviado a validación de mesas'))
  } else if (targetColumn === 'pendiente_lanzamiento') {
    updated.auditTrail.push(entry('Movido a pendiente de lanzamiento'))
    if (getColumnIndex(order.column) > getColumnIndex('pendiente_lanzamiento')) {
      updated.assignedTables = []
      updated.tablesValidated = false
    }
  } else if (targetColumn === 'en_ejecucion') {
    updated.auditTrail.push(entry('En ejecución'))
  } else if (targetColumn === 'bloqueado') {
    updated.auditTrail.push(entry('Marcado como incidencia'))
    updated.alerts = [...updated.alerts, 'Incidencia']
  } else if (targetColumn === 'finalizado') {
    updated.auditTrail.push(entry('Finalizado'))
  } else if (targetColumn === 'en_backlog') {
    updated.auditTrail.push(entry('Movido en backlog'))
    if (getColumnIndex(order.column) > getColumnIndex('en_backlog')) {
      updated.assignedTables = []
      updated.tablesValidated = false
    }
  }

  if (
    getColumnIndex(targetColumn) < getColumnIndex(order.column) &&
    isMainFlowColumn(order.column) &&
    isMainFlowColumn(targetColumn)
  ) {
    updated.auditTrail.push(entry('Retrocedido en backlog (master)'))
    if (getColumnIndex(targetColumn) < getColumnIndex('pendiente_validacion')) {
      updated.assignedTables = []
      updated.tablesValidated = false
    } else if (targetColumn === 'pendiente_validacion') {
      updated.tablesValidated = false
    }
  }

  if (
    (order.column === 'finalizado' || order.column === 'bloqueado') &&
    isMainFlowColumn(targetColumn)
  ) {
    updated.auditTrail.push(entry('Recuperado al flujo principal (master)'))
  }

  return updated
}

export function canUserDragOrder(user: User, order: BacklogOrder): boolean {
  return canActOnOrder(user, order.company)
}
