import type { Lang } from '../i18n/translations'
import type { AuditEntity, AuditFilter, AuditEvent } from '../types/admin'
import { normalizeSearch } from './adminViewHelpers'

export function filterActivityLog(
  events: AuditEvent[],
  query: string,
  filter: AuditFilter,
): AuditEvent[] {
  let result = events

  if (filter !== 'all') {
    result = result.filter((event) => event.entity === filter)
  }

  const q = normalizeSearch(query)
  if (!q) return result

  return result.filter((event) => {
    const haystack = [
      event.username,
      event.role,
      event.action,
      event.entity,
      event.detail,
      event.timestamp,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export function getEntityLabel(entity: AuditEntity, lang: Lang): string {
  const labels: Record<Lang, Record<AuditEntity, string>> = {
    es: {
      usuario: 'Usuario',
      empresa: 'Empresa',
      mesa: 'Mesa',
      paletizador: 'Paletizador',
      configuracion: 'Configuración',
      pedido: 'Objetivo',
      validacion: 'Validación',
      autenticacion: 'Autenticación',
      tablet: 'Tablet',
      sistema: 'Sistema',
    },
    en: {
      usuario: 'User',
      empresa: 'Company',
      mesa: 'Table',
      paletizador: 'Palletizer',
      configuracion: 'Configuration',
      pedido: 'Objective',
      validacion: 'Validation',
      autenticacion: 'Authentication',
      tablet: 'Tablet',
      sistema: 'System',
    },
  }
  return labels[lang][entity] ?? entity
}
