import type { Lang } from '../i18n/translations'
import type { User } from '../types/auth'
import type { BacklogColumnId, BacklogOrder } from '../types/backlog'
import { canActOnOrder } from './dashboardPermissions'
import { isSupervisor } from './permissions'
import { resetValidationTables } from './validationHelpers'

export type BacklogToastType = 'error' | 'success' | 'info'

export interface BacklogMoveResult {
  ok: boolean
  message?: string
  toastType?: BacklogToastType
  needsConfirm?: boolean
  needsPrepareModal?: boolean
  confirmAction?: 'incident' | 'cancel' | 'finalize'
}

export const MAIN_BOARD_COLUMNS: BacklogColumnId[] = [
  'en_backlog',
  'en_preparacion',
  'en_produccion',
]

const COLUMN_ORDER: BacklogColumnId[] = [
  'en_backlog',
  'en_preparacion',
  'en_produccion',
  'finalizado',
]

export function getColumnIndex(col: BacklogColumnId): number {
  return COLUMN_ORDER.indexOf(col)
}

const MAIN_FLOW: BacklogColumnId[] = ['en_backlog', 'en_preparacion', 'en_produccion']

function isMainFlowColumn(col: BacklogColumnId): boolean {
  return MAIN_FLOW.includes(col)
}

export function isValidTransition(
  from: BacklogColumnId,
  to: BacklogColumnId,
  isMaster = false,
): boolean {
  if (from === to) return true

  if (
    isMaster &&
    isMainFlowColumn(from) &&
    isMainFlowColumn(to) &&
    getColumnIndex(to) < getColumnIndex(from)
  ) {
    return true
  }

  if (isMaster && from === 'finalizado' && isMainFlowColumn(to)) {
    return true
  }

  const allowed: Record<BacklogColumnId, BacklogColumnId[]> = {
    en_backlog: ['en_preparacion'],
    en_preparacion: ['en_produccion'],
    en_produccion: ['finalizado'],
    finalizado: [],
  }

  return allowed[from]?.includes(to) ?? false
}

export function isBackwardMove(from: BacklogColumnId, to: BacklogColumnId): boolean {
  if (!isMainFlowColumn(from) || !isMainFlowColumn(to)) {
    if (from === 'finalizado') return isMainFlowColumn(to)
    return false
  }
  return getColumnIndex(to) < getColumnIndex(from)
}

function messages(lang: Lang) {
  return lang === 'es'
    ? {
        noPermission: 'Acción no permitida para tu empresa.',
        needsPreparation: 'El objetivo debe pasar por preparación antes de producir.',
        prepareRequired: 'Usa el modal de preparación para reservar estaciones.',
        masterFinish: 'Solo un usuario autorizado puede finalizar objetivos.',
        confirmFinalize:
          'Este objetivo se marcará como acabado y liberará recursos en la simulación. ¿Deseas continuar?',
        invalidTransition: 'Transición no permitida en el flujo operativo.',
        recipePending: 'Esperando confirmación de celda/receta.',
        movedBack: 'Objetivo retrocedido en la cola.',
      }
    : {
        noPermission: 'Action not allowed for your company.',
        needsPreparation: 'The objective must go through preparation before production.',
        prepareRequired: 'Use the preparation modal to reserve stations.',
        masterFinish: 'Only an authorized user can complete objectives.',
        confirmFinalize:
          'This objective will be marked as completed and release resources. Continue?',
        invalidTransition: 'Transition not allowed in the operational flow.',
        recipePending: 'Waiting for cell/recipe confirmation.',
        movedBack: 'Objective moved back in the queue.',
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

  if (targetColumn === 'finalizado') {
    if (user.role !== 'superadmin') {
      return { ok: false, message: msg.masterFinish, toastType: 'error' }
    }
    if (order.column !== 'en_produccion') {
      return { ok: false, message: msg.invalidTransition, toastType: 'error' }
    }
    return {
      ok: false,
      needsConfirm: true,
      confirmAction: 'finalize',
      message: msg.confirmFinalize,
    }
  }

  if (targetColumn === 'en_preparacion' && order.column === 'en_backlog') {
    return { ok: false, needsPrepareModal: true }
  }

  if (targetColumn === 'en_produccion') {
    if (order.column !== 'en_preparacion') {
      return { ok: false, message: msg.needsPreparation, toastType: 'error' }
    }
    if (!isSupervisor(user)) {
      return { ok: false, message: msg.recipePending, toastType: 'error' }
    }
  }

  const isMaster = user.role === 'superadmin'

  if (!isValidTransition(order.column, targetColumn, isMaster)) {
    if (targetColumn === 'en_preparacion' && order.column === 'en_backlog') {
      return { ok: false, needsPrepareModal: true }
    }
    return { ok: false, message: msg.invalidTransition, toastType: 'error' }
  }

  if (isMaster && isBackwardMove(order.column, targetColumn)) {
    return { ok: true, message: msg.movedBack, toastType: 'info' }
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

  if (targetColumn === 'en_preparacion') {
    updated.auditTrail.push(entry('En preparación'))
  } else if (targetColumn === 'en_produccion') {
    updated.productionState = 'producing'
    updated.preparationStatus = undefined
    updated.auditTrail.push(entry('En producción'))
  } else if (targetColumn === 'finalizado') {
    updated.productionState = 'completed'
    updated.auditTrail.push(entry('Acabado'))
  } else if (targetColumn === 'en_backlog') {
    updated.auditTrail.push(entry('Movido a por ordenar'))
    if (getColumnIndex(order.column) > getColumnIndex('en_backlog')) {
      Object.assign(updated, resetValidationTables(updated))
      updated.preparationStatus = undefined
      updated.productionState = undefined
    }
  }

  if (
    getColumnIndex(targetColumn) < getColumnIndex(order.column) &&
    isMainFlowColumn(order.column) &&
    isMainFlowColumn(targetColumn)
  ) {
    updated.auditTrail.push(entry('Retrocedido (master)'))
    if (getColumnIndex(targetColumn) <= getColumnIndex('en_backlog')) {
      Object.assign(updated, resetValidationTables(updated))
      updated.preparationStatus = undefined
    }
  }

  if (order.column === 'finalizado' && isMainFlowColumn(targetColumn)) {
    updated.auditTrail.push(entry('Recuperado al flujo principal (master)'))
    updated.productionState = targetColumn === 'en_produccion' ? 'producing' : undefined
  }

  return updated
}

export function canUserDragOrder(user: User, order: BacklogOrder): boolean {
  return canActOnOrder(user, order.company)
}
