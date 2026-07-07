import type { BacklogOrder, ValidationTable } from '../types/backlog'
import type { CellAlarm } from '../types/cellAlarm'
import type { DailyOrder } from '../types/dailyOrder'
import type { PlantPalletizerElement, PlantTable } from '../types/plant'
import { rebuildPlantTablesFromOrders } from '../utils/plantSync'
import { createCleanPalletizers, createCleanPlantTables } from './mockPlantTables'

export const DEMO_SCENARIO_VERSION = '1'

/** Total cajas del día en el escenario demo. */
export const DEMO_DAILY_ORDERS_TOTAL = 114_016

function audit(action: string, user = 'Sistema'): BacklogOrder['auditTrail'][0] {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    timestamp: new Date().toISOString(),
    user,
  }
}

const emptyAssignment = {
  assignedTableIds: [] as string[],
  assignedTables: [] as string[],
  assignmentMode: 'none' as const,
  validationTables: [] as ValidationTable[],
}

function po(
  partial: Omit<BacklogOrder, 'auditTrail' | 'tablesValidated' | 'alerts' | 'priority'> & {
    audit?: string[]
    alerts?: string[]
    priority?: number
  },
): BacklogOrder {
  const { audit: auditActions, alerts = [], priority = 1, ...rest } = partial
  return {
    ...rest,
    tablesValidated: rest.column === 'en_produccion' || rest.column === 'finalizado',
    alerts,
    priority,
    auditTrail: (auditActions ?? ['Orden de producción creada']).map((a) => audit(a)),
  }
}

function dailyTemplate(
  id: string,
  variedad: string,
  estilo: string,
  referencia: string,
  barcode: string,
  empresa: 'SUMO' | 'MAF',
  totalCajasDia: number,
): DailyOrder {
  return {
    id,
    fecha: '2025-01-15',
    estilo,
    referencia,
    barcode,
    empresa,
    producto: 'Naranja',
    variedad,
    totalCajasDia,
    cajasAsignadas: 0,
    cajasCompletadas: 0,
    cajasRestantes: totalCajasDia,
    porcentajeAsignado: 0,
    porcentajeCompletado: 0,
    porcentajeRestante: 100,
    estado: 'pendiente',
    ordenesProduccionIds: [],
    events: [
      {
        id: `ev-${id}`,
        at: '2025-01-15T06:00:00.000Z',
        action: 'Pedido del día cargado',
        user: 'Sistema',
        detail: variedad,
      },
    ],
  }
}

/** Plantillas de pedidos del día — cantidades se sincronizan con órdenes de producción. */
export const DEMO_DAILY_ORDER_TEMPLATES: DailyOrder[] = [
  dailyTemplate('DO-NAV-001', 'Naranja Navelina', 'Display Pack', 'REF-NAVELINA', '8437001000012', 'SUMO', 31_220),
  dailyTemplate('DO-VAL-001', 'Naranja Valencia Late', 'smCsmr 7ct', 'REF-VALENCIA-LATE', '8437001000029', 'MAF', 31_739),
  dailyTemplate('DO-LAN-001', 'Naranja Lane Late', 'Cartons', 'REF-LANE-LATE', '8437001000036', 'SUMO', 24_438),
  dailyTemplate('DO-SAL-001', 'Naranja Salustiana', 'Totes/Bags', 'REF-SALUSTIANA', '8437001000043', 'MAF', 14_784),
  dailyTemplate('DO-CAR-001', 'Naranja Cara Cara', '4 - 3lb Club', 'REF-CARA-CARA', '8437001000050', 'SUMO', 680),
  dailyTemplate('DO-NVL-001', 'Naranja Navelate', '7ct', 'REF-NAVELATE', '8437001000067', 'MAF', 5_828),
  dailyTemplate('DO-NEW-001', 'Naranja Newhall', 'Consumer Pack', 'REF-NEWHALL', '8437001000074', 'SUMO', 2_032),
  dailyTemplate('DO-SAN-001', 'Naranja Sanguinelli', 'Euro 2 piece', 'REF-SANGUINELLI', '8437001000081', 'MAF', 740),
  dailyTemplate('DO-TAR-001', 'Naranja Tarocco Rosso', '1/2 Carton', 'REF-TAROCCO-ROSSO', '8437001000098', 'SUMO', 1_956),
  dailyTemplate('DO-MOR-001', 'Naranja Moro', '6423 RPC', 'REF-MORO', '8437001000104', 'MAF', 396),
  dailyTemplate('DO-WAS-001', 'Naranja Washington Navel', '6419 RPC', 'REF-WASHINGTON-NAVEL', '8437001000111', 'SUMO', 200),
]

/** Órdenes de producción del escenario demo coherente. */
export const DEMO_PRODUCTION_ORDERS: BacklogOrder[] = [
  po({
    id: 'ORD-NAV-001',
    pedidoDiaId: 'DO-NAV-001',
    estilo: 'Display Pack',
    barcode: '8437001000012',
    company: 'SUMO',
    reference: 'REF-NAVELINA',
    product: 'Naranja',
    variety: 'Naranja Navelina',
    boxes: 10_000,
    boxesPerHour: 2_400,
    column: 'en_produccion',
    productionState: 'producing',
    etc: '12:45',
    endTime: '15:05',
    occupancyPercent: 69,
    requiredTables: 2,
    assignedTableIds: ['R4', 'R3'],
    assignedTables: ['R4', 'R3'],
    assignmentMode: 'automatic',
    validationTables: [],
    alerts: ['La orden está enviando más cajas de las establecidas para la referencia.'],
    audit: ['Orden lanzada', 'Aceptada por operario', 'En producción', 'Alarma: exceso de cajas'],
  }),
  po({
    id: 'ORD-NAV-002',
    pedidoDiaId: 'DO-NAV-001',
    estilo: 'Display Pack',
    barcode: '8437001000012',
    company: 'SUMO',
    reference: 'REF-NAVELINA',
    product: 'Naranja',
    variety: 'Naranja Navelina',
    boxes: 8_000,
    boxesPerHour: 2_000,
    column: 'en_preparacion',
    preparationStatus: 'pending_preparation',
    etc: '15:00',
    endTime: '19:00',
    requiredTables: 2,
    ...emptyAssignment,
    alerts: ['Pendiente de aceptación por operario'],
    audit: ['Orden lanzada', 'Pendiente de aceptación'],
    priority: 2,
  }),
  po({
    id: 'ORD-VAL-001',
    pedidoDiaId: 'DO-VAL-001',
    estilo: 'smCsmr 7ct',
    barcode: '8437001000029',
    company: 'MAF',
    reference: 'REF-VALENCIA-LATE',
    product: 'Naranja',
    variety: 'Naranja Valencia Late',
    boxes: 12_000,
    boxesPerHour: 2_500,
    column: 'en_produccion',
    productionState: 'temp_waiting',
    etc: '13:30',
    endTime: '15:20',
    occupancyPercent: 39,
    requiredTables: 1,
    assignedTableIds: ['R6'],
    assignedTables: ['R6'],
    assignmentMode: 'automatic',
    validationTables: [],
    alerts: ['La orden está enviando menos cajas de las establecidas para la referencia.'],
    audit: ['En producción', 'En espera temporal', 'Alarma: falta de cajas'],
  }),
  po({
    id: 'ORD-LAN-001',
    pedidoDiaId: 'DO-LAN-001',
    estilo: 'Cartons',
    barcode: '8437001000036',
    company: 'SUMO',
    reference: 'REF-LANE-LATE',
    product: 'Naranja',
    variety: 'Naranja Lane Late',
    boxes: 9_000,
    boxesPerHour: 2_300,
    column: 'en_produccion',
    productionState: 'element_blocked',
    etc: '16:00',
    endTime: '18:48',
    occupancyPercent: 52,
    requiredTables: 1,
    assignedTableIds: ['M2'],
    assignedTables: ['M2'],
    assignmentMode: 'manual',
    validationTables: [],
    alerts: ['La celda asociada a la orden está bloqueada temporalmente por una incidencia.'],
    audit: ['En producción', 'Bloqueo por incidencia'],
  }),
  po({
    id: 'ORD-SAL-001',
    pedidoDiaId: 'DO-SAL-001',
    estilo: 'Totes/Bags',
    barcode: '8437001000043',
    company: 'MAF',
    reference: 'REF-SALUSTIANA',
    product: 'Naranja',
    variety: 'Naranja Salustiana',
    boxes: 6_000,
    boxesPerHour: 1_800,
    column: 'en_produccion',
    productionState: 'temp_waiting',
    etc: '17:30',
    endTime: '20:50',
    occupancyPercent: 22,
    requiredTables: 1,
    assignedTableIds: ['P5'],
    assignedTables: ['P5'],
    assignmentMode: 'manual',
    validationTables: [],
    alerts: ['En espera temporal'],
    audit: ['En producción', 'En espera temporal'],
  }),
  po({
    id: 'ORD-CAR-001',
    pedidoDiaId: 'DO-CAR-001',
    estilo: '4 - 3lb Club',
    barcode: '8437001000050',
    company: 'SUMO',
    reference: 'REF-CARA-CARA',
    product: 'Naranja',
    variety: 'Naranja Cara Cara',
    boxes: 680,
    boxesPerHour: 800,
    column: 'finalizado',
    productionState: 'completed',
    boxesProduced: 680,
    etc: '09:00',
    endTime: '09:51',
    requiredTables: 2,
    ...emptyAssignment,
    audit: ['Orden lanzada', 'Acabada'],
  }),
  po({
    id: 'ORD-TAR-001',
    pedidoDiaId: 'DO-TAR-001',
    estilo: '1/2 Carton',
    barcode: '8437001000098',
    company: 'SUMO',
    reference: 'REF-TAROCCO-ROSSO',
    product: 'Naranja',
    variety: 'Naranja Tarocco Rosso',
    boxes: 1_000,
    boxesPerHour: 800,
    column: 'en_preparacion',
    preparationStatus: 'pending_preparation',
    etc: '14:00',
    endTime: '15:15',
    requiredTables: 2,
    ...emptyAssignment,
    alerts: ['Pendiente de aceptación por operario'],
    audit: ['Orden lanzada'],
    priority: 3,
  }),
]

export const DEMO_SCENARIO_ORDER_IDS = DEMO_PRODUCTION_ORDERS.map((o) => o.id)

/** Eventos operativos alineados con órdenes y estaciones del escenario. */
export const DEMO_CELL_ALARMS: CellAlarm[] = [
  {
    id: 'EV-EXCESO-001',
    cellCode: 'R4',
    type: 'Exceso de cajas',
    summary: 'Más cajas de las establecidas',
    severity: 'warning',
    time: '11:18',
    orderReference: 'REF-NAVELINA',
    company: 'SUMO',
    product: 'Naranja',
    variety: 'Naranja Navelina',
    message:
      'La orden está enviando más cajas de las establecidas para la referencia.',
    status: 'active',
    category: 'operational',
    isCritical: true,
  },
  {
    id: 'EV-FALTA-001',
    cellCode: 'R6',
    type: 'Falta de cajas',
    summary: 'Menos cajas de las establecidas',
    severity: 'warning',
    time: '10:52',
    orderReference: 'REF-VALENCIA-LATE',
    company: 'MAF',
    product: 'Naranja',
    variety: 'Naranja Valencia Late',
    message:
      'La orden está enviando menos cajas de las establecidas para la referencia.',
    status: 'active',
    category: 'operational',
  },
  {
    id: 'EV-BLOQUEO-001',
    cellCode: 'M2',
    type: 'Bloqueo por ocupación',
    summary: 'Celda bloqueada por ocupación',
    severity: 'critical',
    time: '10:35',
    orderReference: 'REF-LANE-LATE',
    company: 'SUMO',
    product: 'Naranja',
    variety: 'Naranja Lane Late',
    message:
      'La celda asociada a la orden está bloqueada temporalmente por una incidencia.',
    status: 'active',
    category: 'operational',
    isCritical: true,
  },
  {
    id: 'EV-RECETA-001',
    cellCode: 'R1',
    type: 'Cambio de receta pendiente',
    summary: 'Receta pendiente de confirmación',
    severity: 'info',
    time: '10:41',
    orderReference: 'REF-NAVELINA',
    company: 'SUMO',
    product: 'Naranja',
    variety: 'Naranja Navelina',
    message: 'Cambio de receta pendiente antes de aceptar la orden.',
    status: 'reviewed',
    category: 'operational',
  },
]

export const DEMO_PERFORMANCE_SUMMARY = {
  globalEfficiency: 87,
  cpk: 1.34,
  assignedPercent: 40.9,
  completedPercent: 0.6,
  vsPreviousDay: 6,
  todayProduction: 46_680,
  yesterdayProduction: 68_920,
}

export const DEMO_STATION_PERFORMANCE = [
  {
    id: 'R4',
    name: 'R4',
    type: 'robot' as const,
    company: 'SUMO' as const,
    occupancyPercent: 69,
    ordersProcessed: 1,
    events: 1,
    efficiency: 87,
    vsYesterday: 5,
  },
  {
    id: 'R3',
    name: 'R3',
    type: 'robot' as const,
    company: 'SUMO' as const,
    occupancyPercent: 68,
    ordersProcessed: 1,
    events: 0,
    efficiency: 91,
    vsYesterday: 4,
  },
  {
    id: 'R6',
    name: 'R6',
    type: 'robot' as const,
    company: 'MAF' as const,
    occupancyPercent: 39,
    ordersProcessed: 1,
    events: 1,
    efficiency: 72,
    vsYesterday: -2,
  },
  {
    id: 'M2',
    name: 'M2',
    type: 'manual' as const,
    company: 'SUMO' as const,
    occupancyPercent: 52,
    ordersProcessed: 1,
    events: 1,
    efficiency: 48,
    vsYesterday: -1,
  },
  {
    id: 'P5',
    name: 'P5',
    type: 'palletizer' as const,
    company: 'MAF' as const,
    occupancyPercent: 22,
    ordersProcessed: 1,
    events: 0,
    efficiency: 65,
    vsYesterday: 2,
  },
  {
    id: 'R1',
    name: 'R1',
    type: 'robot' as const,
    company: 'SUMO' as const,
    occupancyPercent: 45,
    ordersProcessed: 1,
    events: 1,
    efficiency: 84,
    vsYesterday: 1,
  },
  {
    id: 'R2',
    name: 'R2',
    type: 'robot' as const,
    company: 'SUMO' as const,
    occupancyPercent: 42,
    ordersProcessed: 1,
    events: 0,
    efficiency: 82,
    vsYesterday: 0,
  },
]

export function applyScenarioPalletizers(
  palletizers: PlantPalletizerElement[],
  orders: BacklogOrder[],
): PlantPalletizerElement[] {
  const salOrder = orders.find((o) => o.id === 'ORD-SAL-001')

  return palletizers.map((p) => {
    if (p.id === 'P5' && salOrder) {
      return {
        ...p,
        status: 'waiting',
        company: 'MAF',
        orderId: salOrder.id,
        alert: 'Cola de salida',
      }
    }
    return { ...p, status: 'idle', company: null, orderId: null, alert: null }
  })
}

export function applyScenarioPlantVisuals(
  tables: PlantTable[],
  palletizers: PlantPalletizerElement[],
  orders: BacklogOrder[],
): { plantTables: PlantTable[]; plantPalletizers: PlantPalletizerElement[] } {
  let plantTables = rebuildPlantTablesFromOrders(tables, orders)

  plantTables = plantTables.map((table) => {
    if (table.id === 'M2' && table.orderId === 'ORD-LAN-001') {
      return { ...table, status: 'blocked', alert: 'Bloqueo por ocupación' }
    }
    if (table.id === 'R4' && table.orderId === 'ORD-NAV-001') {
      return { ...table, speedStatus: 'slow', alert: table.alert ?? 'Exceso de cajas en referencia' }
    }
    return table
  })

  const plantPalletizers = applyScenarioPalletizers(palletizers, orders)
  return { plantTables, plantPalletizers }
}

export function buildFullDemoState(
  dailyOrders: DailyOrder[],
  orders: BacklogOrder[] = DEMO_PRODUCTION_ORDERS,
) {
  const baseTables = createCleanPlantTables()
  const basePalletizers = createCleanPalletizers()
  const { plantTables, plantPalletizers } = applyScenarioPlantVisuals(
    baseTables,
    basePalletizers,
    orders,
  )

  return {
    scenarioVersion: DEMO_SCENARIO_VERSION,
    dailyOrders,
    orders,
    plantTables,
    plantPalletizers,
  }
}

export function buildCleanDemoState(dailyOrders: DailyOrder[]) {
  return {
    scenarioVersion: DEMO_SCENARIO_VERSION,
    dailyOrders,
    orders: [] as BacklogOrder[],
    plantTables: createCleanPlantTables(),
    plantPalletizers: createCleanPalletizers(),
  }
}

export function isLegacyScenarioState(dailyOrders: DailyOrder[] | undefined): boolean {
  if (!dailyOrders?.length) return false
  return dailyOrders.some((d) => /^pd-\d+$/i.test(d.id))
}

/** Detecta IDs de órdenes del wireframe antiguo (no confundir con `po-{pedidoDiaId}-…`). */
export function hasLegacyProductionOrderIds(orders: BacklogOrder[] | undefined): boolean {
  if (!orders?.length) return false
  return orders.some((o) => /^(bk-alm|bk-\d|po-\d+)$/i.test(o.id))
}
