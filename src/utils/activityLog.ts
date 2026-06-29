import type { AuditEntity, AuditEvent } from '../types/admin'
import type { User } from '../types/auth'
import { addAuditEvent, getAuditLog } from './adminStorage'

/** Registra una acción de usuario en el log global (visible en /admin). */
export function logActivity(
  actor: User,
  action: string,
  entity: AuditEntity,
  detail: string,
): AuditEvent {
  return addAuditEvent(actor, action, entity, detail)
}

/** Registra eventos del sistema (sin usuario autenticado). */
export function logSystemActivity(
  action: string,
  detail: string,
  entity: AuditEntity = 'sistema',
): AuditEvent {
  return addAuditEvent(
    { id: 'system', name: 'Sistema', username: 'sistema', role: 'master', company: 'CMSA' },
    action,
    entity,
    detail,
  )
}

export function getActivityLog(): AuditEvent[] {
  return getAuditLog()
}

export function formatActivityTimestamp(iso: string, lang: 'es' | 'en'): string {
  return new Date(iso).toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export { addAuditEvent as pushAuditEvent } from './adminStorage'
