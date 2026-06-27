import type {
  ActiveProductionItem,
  DashboardAlert,
  DashboardOrder,
  DashboardSnapshot,
  GeneralStatus,
  PlantTable,
} from '../types/dashboard'

export interface DashboardOperationalCounts {
  inQueue: number
  pendingValidation: number
  inExecution: number
  blocked: number
  freeTables: number
  occupiedTables: number
}

export interface CompanyCapacitySummary {
  company: 'SUMO' | 'MAF'
  availablePercent: number
  loadPercent: number
  occupiedTables: number
  totalTables: number
  activeOrders: number
}

export interface AttentionItem {
  id: string
  kind: 'validation' | 'critical' | 'conflict' | 'finishing' | 'blocked' | 'warning'
  title: string
  detail?: string
  actionTo?: string
  actionKey?: 'goValidation' | 'goPlant' | 'goBacklog' | 'viewDetail'
}

export interface PlantSummaryCounts {
  free: number
  occupied: number
  blocked: number
  pending: number
}

export function getHeroMessageKey(status: GeneralStatus): 'heroStable' | 'heroWarnings' | 'heroReview' {
  if (status === 'ok') return 'heroStable'
  if (status === 'warning') return 'heroWarnings'
  return 'heroReview'
}

export function computeOperationalCounts(data: DashboardSnapshot): DashboardOperationalCounts {
  const orders = data.todayOrders
  return {
    inQueue: orders.filter((o) => o.status === 'pending').length,
    pendingValidation: orders.filter((o) => o.status === 'validation').length,
    inExecution: orders.filter((o) => o.status === 'active' || o.status === 'finishing').length,
    blocked: orders.filter((o) => o.status === 'delayed').length,
    freeTables: data.tables.filter((t) => t.state === 'idle').length,
    occupiedTables: data.kpis.occupiedTables,
  }
}

export function computeCompanyCapacity(data: DashboardSnapshot): CompanyCapacitySummary[] {
  return (['SUMO', 'MAF'] as const).map((company) => {
    const companyKey = company.toLowerCase() as 'sumo' | 'maf'
    const companyTables = data.tables.filter(
      (t) => t.state === companyKey || (t.state === 'warning' && company === 'SUMO'),
    )
    const totalTables = Math.max(companyTables.length, 1)
    const occupiedTables = companyTables.filter((t) => t.state !== 'idle').length
    const loadPercent = Math.round((occupiedTables / totalTables) * 100)
    const availablePercent = Math.max(0, 100 - loadPercent)
    const activeOrders = data.todayOrders.filter(
      (o) =>
        o.company === company &&
        (o.status === 'active' || o.status === 'finishing' || o.status === 'delayed'),
    ).length

    return {
      company,
      availablePercent,
      loadPercent,
      occupiedTables,
      totalTables,
      activeOrders,
    }
  })
}

export function computePlantSummary(data: DashboardSnapshot): PlantSummaryCounts {
  const tables = data.tables
  return {
    free: tables.filter((t) => t.state === 'idle').length,
    occupied: tables.filter((t) => t.state === 'sumo' || t.state === 'maf' || t.state === 'mixed').length,
    blocked: tables.filter((t) => t.state === 'warning').length,
    pending: data.todayOrders.filter((o) => o.status === 'validation').length,
  }
}

export function getRelevantOrders(orders: DashboardOrder[]): DashboardOrder[] {
  return orders
    .filter((o) => ['active', 'delayed', 'validation', 'finishing'].includes(o.status))
    .slice(0, 5)
}

export function enrichProductionItem(
  item: ActiveProductionItem,
  orders: DashboardOrder[],
): ActiveProductionItem & {
  variety?: string
  estimatedEnd?: string
  status?: DashboardOrder['status']
} {
  const order = orders.find((o) => o.reference === item.reference)
  if (!order) return item
  return {
    ...item,
    variety: order.variety,
    estimatedEnd: order.estimatedEnd,
    status: order.status,
  }
}

export function buildAttentionItems(data: DashboardSnapshot): AttentionItem[] {
  const items: AttentionItem[] = []

  data.todayOrders
    .filter((o) => o.status === 'validation')
    .forEach((o) => {
      items.push({
        id: `val-${o.id}`,
        kind: 'validation',
        title: o.reference,
        detail: o.alerts[0] ?? `${o.product} · ${o.variety}`,
        actionTo: '/validation',
        actionKey: 'goValidation',
      })
    })

  data.alerts
    .filter((a) => a.severity === 'critical')
    .forEach((a) => {
      items.push({
        id: `alert-${a.id}`,
        kind: 'critical',
        title: a.message,
        detail: a.time,
        actionTo: '/plant-map',
        actionKey: 'goPlant',
      })
    })

  const conflictAlerts = data.alerts.filter(
    (a) => a.severity === 'critical' && a.message.toLowerCase().includes('conflicto'),
  )
  data.tables
    .filter((t) => t.state === 'warning')
    .forEach((t) => {
      if (!items.some((i) => i.id === `table-${t.id}`)) {
        items.push({
          id: `table-${t.id}`,
          kind: 'conflict',
          title: `${t.label} — pendiente / aviso`,
          actionTo: '/plant-map',
          actionKey: 'goPlant',
        })
      }
    })

  if (conflictAlerts.length === 0) {
    data.palletizers
      .filter((p) => p.state === 'conflict')
      .forEach((p) => {
        items.push({
          id: `pal-${p.id}`,
          kind: 'conflict',
          title: `${p.label} en conflicto`,
          actionTo: '/plant-map',
          actionKey: 'goPlant',
        })
      })
  }

  data.todayOrders
    .filter((o) => o.status === 'finishing')
    .forEach((o) => {
      items.push({
        id: `fin-${o.id}`,
        kind: 'finishing',
        title: o.reference,
        detail: o.alerts[0] ?? `${o.product} · ${o.variety}`,
        actionTo: '/backlog',
        actionKey: 'goBacklog',
      })
    })

  data.todayOrders
    .filter((o) => o.status === 'delayed')
    .forEach((o) => {
      items.push({
        id: `blk-${o.id}`,
        kind: 'blocked',
        title: o.reference,
        detail: o.alerts.join(' · '),
        actionTo: '/backlog',
        actionKey: 'goBacklog',
      })
    })

  data.alerts
    .filter((a) => a.severity === 'warning' && !items.some((i) => i.title === a.message))
    .slice(0, 2)
    .forEach((a) => {
      items.push({
        id: `warn-${a.id}`,
        kind: 'warning',
        title: a.message,
        detail: a.time,
        actionTo: '/plant-map',
        actionKey: 'goPlant',
      })
    })

  return items.slice(0, 5)
}

export function countActiveAlerts(alerts: DashboardAlert[]): number {
  return alerts.filter((a) => a.severity !== 'info').length
}

export function tableStateLabel(table: PlantTable): string {
  return table.label
}
