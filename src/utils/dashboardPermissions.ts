import type { Lang } from '../i18n/translations'
import type { User } from '../types/auth'
import type { Company } from '../types/auth'

type OrderCompany = Extract<Company, 'SUMO' | 'MAF'>

export function canActOnOrder(user: User, orderCompany: OrderCompany): boolean {
  if (user.role === 'master') return true
  if (user.role !== 'user') return false
  return user.company === orderCompany
}

export function getActionDisabledReason(
  user: User,
  orderCompany: OrderCompany,
  lang: Lang,
): string | null {
  if (canActOnOrder(user, orderCompany)) return null

  if (user.role === 'master') return null

  if (user.company === 'SUMO' && orderCompany === 'MAF') {
    return lang === 'es'
      ? 'Acción reservada a operarios MAF'
      : 'Action reserved for MAF operators'
  }

  if (user.company === 'MAF' && orderCompany === 'SUMO') {
    return lang === 'es'
      ? 'Acción reservada a operarios SUMO'
      : 'Action reserved for SUMO operators'
  }

  return lang === 'es' ? 'Sin permisos para esta acción' : 'No permission for this action'
}
