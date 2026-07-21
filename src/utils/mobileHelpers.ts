import type { Lang } from '../i18n/translations'
import type { BacklogOrder } from '../types/backlog'
import type { CmsaPersistedState, PlantTable } from '../types/plant'
import {
  buildTabletAlerts,
  computeGeneralStatus,
  type TabletAlert,
  type TabletGeneralStatus,
} from './tabletHelpers'
import { formatTableList, resolveAssignedTableIds } from './tableAssignment'

export type { TabletGeneralStatus as MobileGeneralStatus }

const OCCUPIED = new Set(['occupied', 'validated', 'waiting'])

export interface MobileCompanyStats {
  company: 'SUMO' | 'MAF'
  availablePercent: number
  loadPercent: number
  occupiedTables: number
  activeOrders: number
}

export interface MobileActiveOrder {
  id: string
  reference: string
  company: string
  product: string
  tables: string
  remainingMinutes: number | null
  remainingLabel: string | null
  endTime: string | null
  status: string
  alert: string | null
}

export interface MobileFinishingOrder {
  id: string
  reference: string
  company: string
  endTime: string | null
  remainingMinutes: number | null
  remainingLabel: string | null
  status: string
}

export interface MobileAlertItem extends TabletAlert {
  time: string
  icon: string
}

export interface MobileTableSummary {
  free: number
  occupied: number
  blocked: number
  manualInUse: number
  automaticInUse: number
}

export interface MobileOccupancyVisual {
  automaticOccupied: number
  automaticTotal: number
  manualOccupied: number
  manualTotal: number
  palletizersActive: number
  palletizersTotal: number
}

function formatNow(lang: Lang): string {
  return new Date().toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function mockAlertTime(index: number): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - index * 7 - 3)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function parseEndTimeMinutes(endTime: string): number | null {
  const match = endTime.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const now = new Date()
  const end = new Date()
  end.setHours(Number(match[1]), Number(match[2]), 0, 0)

  if (end.getTime() <= now.getTime()) {
    end.setDate(end.getDate() + 1)
  }

  const diffMs = end.getTime() - now.getTime()
  return Math.max(1, Math.round(diffMs / 60000))
}

function formatRemainingMinutes(minutes: number | null, lang: Lang): string | null {
  if (minutes == null) return null
  if (lang === 'es') return `${minutes} min restantes`
  return `${minutes} min remaining`
}

function formatFinishingLine(minutes: number | null, endTime: string | null, lang: Lang): string | null {
  if (minutes == null || !endTime) return null
  if (lang === 'es') return `Finaliza en ${minutes} min · ${endTime}`
  return `Finishes in ${minutes} min · ${endTime}`
}

function alertIcon(alert: TabletAlert): string {
  const msg = alert.message.toLowerCase()
  if (alert.severity === 'critical') return '⚠'
  if (/paletizador|palletizer/.test(msg)) return '⏸'
  if (/lento|slow|flujo/.test(msg)) return '🐢'
  if (/próximo|finishing|finalizar/.test(msg)) return '⏱'
  return '⚠'
}

/** Capacidad disponible % desde la perspectiva de cada empresa (su universo = planta compartida). */
function computeCompanyAvailablePercent(
  company: 'SUMO' | 'MAF',
  state: CmsaPersistedState,
): number {
  const total = state.plantTables.length || 1
  const occupiedByCompany = state.plantTables.filter(
    (t) => t.company === company && OCCUPIED.has(t.status),
  ).length
  const activeOrders = state.orders.filter(
    (o) => o.company === company && o.column === 'en_produccion',
  ).length

  const tableLoad = (occupiedByCompany / total) * 55
  const orderLoad = activeOrders * 9
  return Math.max(5, Math.min(95, Math.round(100 - tableLoad - orderLoad)))
}

export function getMobileDateTime(lang: Lang): string {
  return formatNow(lang)
}

export function getMobileGeneralStatus(state: CmsaPersistedState): TabletGeneralStatus {
  return computeGeneralStatus(state)
}

export function getMobileStatusMessage(
  status: TabletGeneralStatus,
  lang: Lang,
): string {
  if (lang === 'es') {
    if (status === 'critical') return 'Revisión necesaria'
    if (status === 'warning') return 'Hay avisos activos'
    return 'Producción estable'
  }
  if (status === 'critical') return 'Review required'
  if (status === 'warning') return 'Active warnings'
  return 'Stable production'
}

export function computeMobileCompanyStats(state: CmsaPersistedState): MobileCompanyStats[] {
  const companies: Array<'SUMO' | 'MAF'> = ['SUMO', 'MAF']

  return companies.map((company) => {
    const occupiedTables = state.plantTables.filter(
      (t) => t.company === company && OCCUPIED.has(t.status),
    ).length
    const activeOrders = state.orders.filter(
      (o) => o.company === company && o.column === 'en_produccion',
    ).length
    const availablePercent = computeCompanyAvailablePercent(company, state)

    return {
      company,
      availablePercent,
      loadPercent: 100 - availablePercent,
      occupiedTables,
      activeOrders,
    }
  })
}

export function getMobileActiveProduction(
  state: CmsaPersistedState,
  lang: Lang,
): MobileActiveOrder[] {
  return state.orders
    .filter((o) => o.column === 'en_produccion')
    .map((order) => {
      const remainingMinutes = order.endTime ? parseEndTimeMinutes(order.endTime) : null
      return {
        id: order.id,
        reference: order.reference,
        company: order.company,
        product: order.product,
        tables: formatTableList(resolveAssignedTableIds(order)),
        remainingMinutes,
        remainingLabel: formatRemainingMinutes(remainingMinutes, lang),
        endTime: order.endTime || null,
        status: lang === 'es' ? 'En ejecución' : 'In execution',
        alert: order.alerts[0] ?? null,
      }
    })
}

export function getMobileFinishingSoon(
  orders: BacklogOrder[],
  lang: Lang,
): MobileFinishingOrder[] {
  const label = lang === 'es' ? 'Próximo a finalizar' : 'Finishing soon'

  return orders
    .filter((o) => o.column === 'en_produccion' && o.endTime)
    .map((order) => {
      const remainingMinutes = parseEndTimeMinutes(order.endTime)
      return {
        id: order.id,
        reference: order.reference,
        company: order.company,
        endTime: order.endTime,
        remainingMinutes,
        remainingLabel: formatFinishingLine(remainingMinutes, order.endTime, lang),
        status: label,
      }
    })
    .sort((a, b) => (a.remainingMinutes ?? 999) - (b.remainingMinutes ?? 999))
    .slice(0, 5)
}

export function getMobileAlerts(state: CmsaPersistedState, lang: Lang): MobileAlertItem[] {
  const base = buildTabletAlerts(state, lang).filter((a) => a.id !== 'all-ok')
  return base.map((alert, index) => ({
    ...alert,
    time: mockAlertTime(index),
    icon: alertIcon(alert),
  }))
}


export function computeMobileTableSummary(state: CmsaPersistedState): MobileTableSummary {
  const tables = state.plantTables
  const inUse = (t: PlantTable) =>
    ['occupied', 'validated', 'waiting'].includes(t.status)

  return {
    free: tables.filter((t) => t.status === 'free').length,
    occupied: tables.filter((t) =>
      ['occupied', 'validated', 'waiting'].includes(t.status),
    ).length,
    blocked: tables.filter((t) => t.status === 'blocked' || t.status === 'conflict').length,
    manualInUse: tables.filter((t) => t.type === 'manual' && inUse(t)).length,
    automaticInUse: tables.filter((t) => t.type === 'automatic' && inUse(t)).length,
  }
}

export function computeMobileOccupancyVisual(state: CmsaPersistedState): MobileOccupancyVisual {
  const automatic = state.plantTables.filter((t) => t.type === 'automatic')
  const manual = state.plantTables.filter((t) => t.type === 'manual')
  const palletizers = state.plantPalletizers

  const autoInUse = (t: PlantTable) => OCCUPIED.has(t.status)

  return {
    automaticOccupied: automatic.filter(autoInUse).length,
    automaticTotal: automatic.length,
    manualOccupied: manual.filter(autoInUse).length,
    manualTotal: manual.length,
    palletizersActive: palletizers.filter((p) => p.status === 'active' || p.status === 'waiting').length,
    palletizersTotal: palletizers.length,
  }
}
