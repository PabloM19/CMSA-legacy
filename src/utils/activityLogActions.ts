import type { Lang } from '../i18n/translations'
import type { BacklogColumnId } from '../types/backlog'
import type { User } from '../types/auth'
import { logActivity } from './activityLog'

const COLUMN_ACTION_ES: Record<BacklogColumnId, string> = {
  en_backlog: 'Objetivo movido a cola',
  en_preparacion: 'Objetivo en preparación',
  en_produccion: 'Objetivo en producción',
  finalizado: 'Objetivo acabado',
}

const COLUMN_ACTION_EN: Record<BacklogColumnId, string> = {
  en_backlog: 'Objective moved to queue',
  en_preparacion: 'Objective in preparation',
  en_produccion: 'Objective in production',
  finalizado: 'Objective completed',
}

const OPERATIONAL_ROLE_ES: Record<User['role'], string> = {
  user: 'Operario',
  supervisor: 'Supervisor',
  superadmin: 'SuperMaster',
}

function formatOperationalActor(actor: User): string {
  const roleLabel = OPERATIONAL_ROLE_ES[actor.role] ?? actor.name
  if (actor.company === 'SUMO' || actor.company === 'MAF') {
    return `${roleLabel} ${actor.company}`
  }
  return roleLabel
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
  logActivity(actor, 'Objetivo creado', 'pedido', `${reference} · ${company}`)
}

export function logReferenceCreated(actor: User, reference: string): void {
  logActivity(actor, 'Referencia creada', 'configuracion', reference)
}

export function logOrderLaunched(
  actor: User,
  orderReference: string,
  dailyOrderId: string,
): void {
  const actorLabel = formatOperationalActor(actor)
  logActivity(
    actor,
    'Orden lanzada',
    'pedido',
    `${actorLabel} lanzó ${orderReference} desde el pedido ${dailyOrderId}.`,
  )
}

export function logLaunchCancelled(actor: User, reference: string): void {
  const actorLabel = formatOperationalActor(actor)
  logActivity(
    actor,
    'Lanzamiento cancelado',
    'pedido',
    `${actorLabel} canceló el lanzamiento de ${reference}.`,
  )
}

export function logLaunchBlocked(actor: User): void {
  logActivity(
    actor,
    'Lanzamiento bloqueado',
    'pedido',
    'Conflicto por mismo código de barras con distinta configuración de palé/alturas.',
  )
}

export function logOrderAccepted(actor: User, orderReference: string): void {
  logActivity(
    actor,
    'Orden aceptada',
    'pedido',
    `${orderReference} aceptada y movida a En producción.`,
  )
}

export function logAlarmReviewed(actor: User, alarmId: string): void {
  logActivity(
    actor,
    'Evento revisado',
    'sistema',
    `Evento ${alarmId} marcado como revisado.`,
  )
}

export function logOrderWithdrawn(actor: User, reference: string, reason: string): void {
  const actorLabel = formatOperationalActor(actor)
  logActivity(
    actor,
    'Orden retirada',
    'pedido',
    `${actorLabel} retiró ${reference}. Motivo: ${reason}.`,
  )
}

export function logOrderDeleted(actor: User, reference: string, detail: string): void {
  logActivity(actor, 'Orden de producción eliminada', 'pedido', `${reference} · ${detail}`)
}

export function logRecipeConfirmed(actor: User, reference: string): void {
  logActivity(actor, 'Receta confirmada', 'pedido', reference)
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
