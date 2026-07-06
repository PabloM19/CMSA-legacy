import type { Lang } from '../i18n/translations'
import type { AuditEntity, AuditEvent } from '../types/admin'
import { normalizeSearch } from './adminViewHelpers'

export type ActivityCategoryFilter =
  | 'all'
  | 'users'
  | 'production'
  | 'references'
  | 'events'
  | 'system'

export function filterActivityLog(
  events: AuditEvent[],
  query: string,
  filter: ActivityCategoryFilter,
): AuditEvent[] {
  let result = events

  if (filter !== 'all') {
    result = result.filter((event) => matchesActivityCategory(event, filter))
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
      getEntityLabel(event.entity, 'es'),
      getEntityLabel(event.entity, 'en'),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

function matchesActivityCategory(event: AuditEvent, filter: ActivityCategoryFilter): boolean {
  const actionLower = event.action.toLowerCase()

  switch (filter) {
    case 'users':
      return event.entity === 'usuario'
    case 'production':
      return event.entity === 'pedido' || event.entity === 'validacion'
    case 'references':
      return actionLower.includes('referencia')
    case 'events':
      return (
        event.entity === 'sistema' ||
        actionLower.includes('alarma') ||
        actionLower.includes('evento')
      )
    case 'system':
      return (
        event.entity === 'autenticacion' ||
        event.entity === 'tablet' ||
        event.entity === 'configuracion' ||
        event.entity === 'empresa' ||
        event.entity === 'mesa' ||
        event.entity === 'paletizador'
      )
    default:
      return true
  }
}

export function getEntityLabel(entity: AuditEntity, lang: Lang): string {
  const labels: Record<Lang, Record<AuditEntity, string>> = {
    es: {
      usuario: 'Usuario',
      empresa: 'Empresa',
      mesa: 'Mesa',
      paletizador: 'Paletizador',
      configuracion: 'Configuración',
      pedido: 'Producción',
      validacion: 'Producción',
      autenticacion: 'Sistema',
      tablet: 'Sistema',
      sistema: 'Eventos',
    },
    en: {
      usuario: 'User',
      empresa: 'Company',
      mesa: 'Table',
      paletizador: 'Palletizer',
      configuracion: 'Configuration',
      pedido: 'Production',
      validacion: 'Production',
      autenticacion: 'System',
      tablet: 'System',
      sistema: 'Events',
    },
  }
  return labels[lang][entity] ?? entity
}
