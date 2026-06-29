import type { Lang, Translations } from '../i18n/translations'
import type { User } from '../types/auth'
import type { BacklogOrder } from '../types/backlog'
import type { CmsaPersistedState } from '../types/plant'
import {
  computeMobileCompanyStats,
  computeMobileTableSummary,
  getMobileActiveProduction,
  getMobileAlerts,
  getMobileFinishingSoon,
  getMobileGeneralStatus,
  getMobileStatusMessage,
  type MobileActiveOrder,
  type MobileAlertItem,
  type MobileFinishingOrder,
} from './mobileHelpers'
import type { TabletAlert, TabletGeneralStatus } from './tabletHelpers'

type MobileCopy = Translations['mobile']

export interface MobileQuickStats {
  inProduction: number
  pending: number
  alerts: number
  occupiedTables: number
}

export interface MobileHeroStats {
  inProduction: number
  activeAlerts: number
  occupiedTables: number
  finishingSoon: number
}

export function shouldFilterByCompany(user: User): boolean {
  return user.role === 'user' && (user.company === 'SUMO' || user.company === 'MAF')
}

export function filterOrdersForMobileUser(orders: BacklogOrder[], user: User): BacklogOrder[] {
  if (!shouldFilterByCompany(user)) return orders
  return orders.filter((order) => order.company === user.company)
}

export function filterMobileState(state: CmsaPersistedState, user: User): CmsaPersistedState {
  if (!shouldFilterByCompany(user)) return state
  return {
    ...state,
    orders: filterOrdersForMobileUser(state.orders, user),
  }
}

export function getMobileRoleBadge(user: User, d: MobileCopy): string {
  if (user.role === 'master') return d.roleBadgeMaster
  if (user.role === 'validator') return d.roleBadgeValidator
  if (user.company === 'SUMO' || user.company === 'MAF') {
    return `${user.company} · ${d.consultBadge}`
  }
  return d.consultBadge
}

export function getMobileHeaderLine(user: User, d: MobileCopy): string {
  if (user.role === 'master') return d.roleBadgeMaster
  if (user.role === 'validator') return d.roleBadgeValidator
  return `${user.company} · ${d.consultBadge}`
}

export function computeMobileQuickStats(state: CmsaPersistedState, user: User): MobileQuickStats {
  const scoped = filterMobileState(state, user)
  const alerts = getMobileAlerts(scoped, 'es').filter((a) => a.id !== 'all-ok')

  return {
    inProduction: scoped.orders.filter((o) => o.column === 'en_ejecucion').length,
    pending: scoped.orders.filter((o) => o.column === 'pendiente_validacion').length,
    alerts: alerts.length,
    occupiedTables: state.plantTables.filter((t) =>
      ['occupied', 'validated', 'waiting'].includes(t.status),
    ).length,
  }
}

export function computeMobileHeroStats(state: CmsaPersistedState, user: User): MobileHeroStats {
  const scoped = filterMobileState(state, user)
  const alerts = getMobileAlerts(scoped, 'es').filter((a) => a.id !== 'all-ok')

  return {
    inProduction: scoped.orders.filter((o) => o.column === 'en_ejecucion').length,
    activeAlerts: alerts.length,
    occupiedTables: state.plantTables.filter((t) =>
      ['occupied', 'validated', 'waiting', 'pending_validation', 'reserved'].includes(t.status),
    ).length,
    finishingSoon: getMobileFinishingSoon(scoped.orders, 'es').length,
  }
}

export function getMobileHeroMessage(status: TabletGeneralStatus, lang: Lang): string {
  if (lang === 'es') {
    if (status === 'critical') return 'Revisión necesaria'
    if (status === 'warning') return 'Hay avisos pendientes'
    return 'Producción estable'
  }
  if (status === 'critical') return 'Review needed'
  if (status === 'warning') return 'Pending notices'
  return 'Stable production'
}

export function softenMobileAlertMessage(
  alert: TabletAlert,
  d: MobileCopy,
  plant: Translations['plantMap'],
): string {
  const id = alert.id
  const msg = alert.message.toLowerCase()

  if (id.includes('finishing') || /próximo|finishing|finalizar/.test(msg)) {
    return plant.iconClockLong
  }
  if (id.includes('waiting') || /espera|waiting/.test(msg)) {
    return plant.iconWaitLong
  }
  if (id.includes('pending') || /validación|validation/.test(msg)) {
    return d.alertPendingValidation
  }
  if (id.includes('conflict') || id.includes('blocked') || alert.severity === 'critical') {
    return plant.iconWarningLong
  }
  if (/lento|slow|flujo/.test(msg)) {
    return plant.iconSlowLong
  }
  if (/rápido|rapido|fast|ritmo alto/.test(msg)) {
    return plant.iconFastLong
  }
  if (alert.severity === 'warning') {
    return plant.iconWarningLong
  }
  return plant.iconCheckLong
}

export function mapMobileAlertsSoft(
  state: CmsaPersistedState,
  user: User,
  lang: Lang,
  d: MobileCopy,
  plant: Translations['plantMap'],
): MobileAlertItem[] {
  const scoped = filterMobileState(state, user)
  return getMobileAlerts(scoped, lang)
    .filter((a) => a.id !== 'all-ok')
    .map((alert) => ({
      ...alert,
      message: softenMobileAlertMessage(alert, d, plant),
    }))
}

export function getMobileProductionLimited(
  state: CmsaPersistedState,
  user: User,
  lang: Lang,
  limit = 3,
): { items: MobileActiveOrder[]; total: number; moreCount: number } {
  const scoped = filterMobileState(state, user)
  const all = getMobileActiveProduction(scoped, lang)
  return {
    items: all.slice(0, limit),
    total: all.length,
    moreCount: Math.max(0, all.length - limit),
  }
}

export function getMobileFinishingLimited(
  state: CmsaPersistedState,
  user: User,
  lang: Lang,
  limit = 3,
): MobileFinishingOrder[] {
  const scoped = filterMobileState(state, user)
  return getMobileFinishingSoon(scoped.orders, lang).slice(0, limit)
}

export function getMobileCompanyCards(state: CmsaPersistedState, user: User) {
  const all = computeMobileCompanyStats(state)
  if (user.role === 'master' || user.role === 'validator') return all
  if (user.company === 'SUMO') {
    const primary = all.find((c) => c.company === 'SUMO')!
    const other = all.find((c) => c.company === 'MAF')
    return other ? [primary, { ...other, company: 'MAF' as const }] : [primary]
  }
  if (user.company === 'MAF') {
    const primary = all.find((c) => c.company === 'MAF')!
    const other = all.find((c) => c.company === 'SUMO')
    return other ? [primary, { ...other, company: 'SUMO' as const }] : [primary]
  }
  return all
}

export function enrichActiveOrder(order: MobileActiveOrder, raw: BacklogOrder | undefined) {
  return {
    ...order,
    variety: raw?.variety ?? '',
    productLine: raw
      ? [raw.product, raw.variety].filter(Boolean).join(' · ')
      : order.product,
    statusSoft: order.status,
  }
}

export function findOrderById(state: CmsaPersistedState, id: string): BacklogOrder | undefined {
  return state.orders.find((o) => o.id === id)
}

export {
  computeMobileTableSummary,
  getMobileGeneralStatus,
  getMobileStatusMessage,
}
