import type { Lang } from '../i18n/translations'
import type { BacklogColumnId } from '../types/backlog'
import type { User } from '../types/auth'
import { logActivity } from './activityLog'

const COLUMN_ACTION_ES: Record<BacklogColumnId, string> = {
  en_backlog: 'Pedido movido a backlog',
  pendiente_lanzamiento: 'Pedido aceptado',
  pendiente_validacion: 'Pedido enviado a validación',
  en_ejecucion: 'Producción iniciada',
  bloqueado: 'Pedido bloqueado / incidencia',
  finalizado: 'Pedido finalizado',
}

const COLUMN_ACTION_EN: Record<BacklogColumnId, string> = {
  en_backlog: 'Order moved to backlog',
  pendiente_lanzamiento: 'Order accepted',
  pendiente_validacion: 'Order sent to validation',
  en_ejecucion: 'Production started',
  bloqueado: 'Order blocked / incident',
  finalizado: 'Order completed',
}

export function logOrderColumnMove(
  actor: User,
  orderReference: string,
  fromColumn: BacklogColumnId,
  toColumn: BacklogColumnId,
  lang: Lang,
): void {
  if (fromColumn === toColumn) return
  const actionMap = lang === 'es' ? COLUMN_ACTION_ES : COLUMN_ACTION_EN
  logActivity(
    actor,
    actionMap[toColumn],
    'pedido',
    `${orderReference} · ${fromColumn} → ${toColumn}`,
  )
}

export function logOrderCreated(actor: User, reference: string, company: string): void {
  logActivity(actor, 'Pedido creado', 'pedido', `${reference} · ${company}`)
}

export function logTableValidated(actor: User, orderReference: string, tableName: string): void {
  logActivity(actor, 'Mesa validada', 'validacion', `${orderReference} · ${tableName}`)
}

export function logAllTablesValidated(actor: User, orderReference: string): void {
  logActivity(actor, 'Todas las mesas validadas', 'validacion', orderReference)
}

export function logTableConflict(actor: User, orderReference: string, tableName: string): void {
  logActivity(actor, 'Conflicto en mesa', 'validacion', `${orderReference} · ${tableName}`)
}

export function logTableConflictResolved(actor: User, orderReference: string, tableName: string): void {
  logActivity(actor, 'Conflicto resuelto', 'validacion', `${orderReference} · ${tableName}`)
}

export function logAuthLogin(actor: User): void {
  logActivity(actor, 'Inicio de sesión', 'autenticacion', `${actor.username} (${actor.role})`)
}

export function logAuthLogout(actor: User): void {
  logActivity(actor, 'Cierre de sesión', 'autenticacion', actor.username)
}

export function logTabletAction(
  actor: User,
  action: 'incident' | 'stop' | 'resume',
  elementCode: string,
  lang: Lang,
): void {
  const actions =
    lang === 'es'
      ? {
          incident: 'Incidencia marcada en tablet',
          stop: 'Parada simulada desde tablet',
          resume: 'Reanudación desde tablet',
        }
      : {
          incident: 'Incident marked on tablet',
          stop: 'Simulated stop from tablet',
          resume: 'Resume from tablet',
        }
  logActivity(actor, actions[action], 'tablet', elementCode)
}
