import type { BacklogOrder } from '../types/backlog'
import type { CreatedOrder } from '../types/newOrder'
import { getCreatedOrders } from '../utils/orderStorage'

const STORAGE_KEY = 'cmsa-backlog-orders'

function audit(action: string, user = 'Sistema'): BacklogOrder['auditTrail'][0] {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    timestamp: new Date().toISOString(),
    user,
  }
}

export const mockBacklogOrders: BacklogOrder[] = [
  {
    id: 'bk-1',
    company: 'SUMO',
    reference: 'PED-240622-01',
    product: 'Tomate cherry',
    variety: 'Vera',
    boxes: 480,
    boxesPerHour: 96,
    column: 'en_backlog',
    eta: '14:30',
    endTime: '16:45',
    requiredTables: 2,
    assignedTables: [],
    tablesValidated: false,
    alerts: [],
    priority: 1,
    auditTrail: [
      audit('Pedido creado'),
      audit('Pedido aceptado'),
    ],
  },
  {
    id: 'bk-2',
    company: 'MAF',
    reference: 'PED-240622-02',
    product: 'Pimiento rojo',
    variety: 'Valencia',
    boxes: 320,
    boxesPerHour: 72,
    column: 'pendiente_lanzamiento',
    eta: '15:00',
    endTime: '17:10',
    requiredTables: 1,
    assignedTables: [],
    tablesValidated: false,
    alerts: ['Sobrecarga ligera'],
    priority: 1,
    auditTrail: [audit('Pedido creado'), audit('Pedido aceptado')],
  },
  {
    id: 'bk-3',
    company: 'SUMO',
    reference: 'PED-240622-03',
    product: 'Calabacín',
    variety: 'Negro',
    boxes: 200,
    boxesPerHour: 80,
    column: 'pendiente_validacion',
    eta: '13:50',
    endTime: '14:20',
    requiredTables: 1,
    assignedTables: ['M4'],
    tablesValidated: false,
    alerts: ['Pendiente validación'],
    priority: 1,
    auditTrail: [
      audit('Pedido creado'),
      audit('Pedido aceptado'),
      audit('Enviado a validación de mesas'),
    ],
  },
  {
    id: 'bk-4',
    company: 'MAF',
    reference: 'PED-240622-04',
    product: 'Berenjena',
    variety: 'Larga',
    boxes: 260,
    boxesPerHour: 65,
    column: 'en_ejecucion',
    eta: '16:00',
    endTime: '18:30',
    requiredTables: 1,
    assignedTables: ['M3'],
    tablesValidated: true,
    alerts: [],
    priority: 1,
    auditTrail: [
      audit('Pedido creado'),
      audit('Mesas validadas'),
      audit('En ejecución'),
    ],
  },
  {
    id: 'bk-5',
    company: 'SUMO',
    reference: 'PED-240622-05',
    product: 'Pepino',
    variety: 'Almería',
    boxes: 180,
    boxesPerHour: 60,
    column: 'bloqueado',
    eta: '12:00',
    endTime: '13:15',
    requiredTables: 1,
    assignedTables: ['M5'],
    tablesValidated: false,
    alerts: ['Incidencia material'],
    priority: 1,
    auditTrail: [audit('Pedido creado'), audit('Marcado como incidencia')],
  },
  {
    id: 'bk-6',
    company: 'MAF',
    reference: 'PED-240622-06',
    product: 'Tomate pera',
    variety: 'Caniles',
    boxes: 400,
    boxesPerHour: 55,
    column: 'finalizado',
    eta: '09:00',
    endTime: '11:30',
    requiredTables: 1,
    assignedTables: ['M6'],
    tablesValidated: true,
    alerts: [],
    priority: 1,
    auditTrail: [audit('Pedido creado'), audit('Finalizado')],
  },
]

export function convertCreatedOrder(order: CreatedOrder): BacklogOrder {
  return {
    id: order.id,
    company: order.company,
    reference: order.reference,
    product: order.product,
    variety: order.variety,
    boxes: order.boxes,
    boxesPerHour: order.boxesPerHour,
    column: 'en_backlog',
    eta: order.calculation.eta,
    endTime: order.calculation.estimatedEnd,
    requiredTables: order.calculation.requiredTables,
    assignedTables: [],
    tablesValidated: false,
    alerts: order.calculation.alerts.map((a) => a.message),
    priority: 0,
    auditTrail: [
      audit('Pedido creado'),
      audit('Pedido aceptado'),
    ],
  }
}

export function loadBacklogOrders(): BacklogOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as BacklogOrder[]
      if (parsed.length > 0) return normalizePriorities(parsed)
    }
  } catch {
    /* fall through */
  }

  const created = getCreatedOrders().map(convertCreatedOrder)
  const merged = [...created, ...mockBacklogOrders]
  const byId = new Map<string, BacklogOrder>()
  merged.forEach((o) => byId.set(o.id, o))
  const initial = normalizePriorities(Array.from(byId.values()))
  saveBacklogOrders(initial)
  return initial
}

export function saveBacklogOrders(orders: BacklogOrder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

function normalizePriorities(orders: BacklogOrder[]): BacklogOrder[] {
  const columns = [
    'en_backlog',
    'pendiente_lanzamiento',
    'pendiente_validacion',
    'en_ejecucion',
    'bloqueado',
    'finalizado',
  ] as const

  const result = [...orders]
  columns.forEach((col) => {
    const colOrders = result.filter((o) => o.column === col).sort((a, b) => a.priority - b.priority)
    colOrders.forEach((o, idx) => {
      o.priority = idx + 1
    })
  })
  return result
}

export function assignMockTables(required: number): string[] {
  const pool = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6']
  return pool.slice(0, Math.max(1, required))
}

export function computeKpis(orders: BacklogOrder[]) {
  return {
    total: orders.length,
    enBacklog:
      orders.filter((o) => o.column === 'en_backlog' || o.column === 'pendiente_lanzamiento')
        .length,
    pendingValidation: orders.filter((o) => o.column === 'pendiente_validacion').length,
    inExecution: orders.filter((o) => o.column === 'en_ejecucion').length,
    blocked: orders.filter((o) => o.column === 'bloqueado').length,
  }
}
