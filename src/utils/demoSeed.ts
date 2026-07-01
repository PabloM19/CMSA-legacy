import { MOCK_PRODUCTS } from '../data/mockProducts'
import { resetCellAlarmsMock } from '../data/mockCellAlarms'
import {
  createCleanPalletizers,
  createCleanPlantTables,
} from '../data/mockPlantTables'
import type { MockProduct } from '../data/mockProducts'
import type { BacklogOrder, ValidationTable } from '../types/backlog'
import type { CmsaPersistedState, PlantPalletizerElement, PlantTable } from '../types/plant'
import { resetAdminDataToSeed } from './adminStorage'
import { ADMIN_PLANT_OVERRIDES_KEY, clearAdminPlantOverrides } from './adminPlantOverrides'
import { BACKLOG_STORAGE_KEY, normalizePriorities, saveState } from './backlogStorage'
import { clearBacklogViewPrefs } from './backlogViewPrefs'
import { logSystemActivity } from './activityLog'
import { clearCreatedOrders } from './orderStorage'
import { rebuildPlantTablesFromOrders } from './plantSync'
import {
  TABLET_OVERRIDES_KEY,
  TABLET_SNAPSHOTS_KEY,
  clearTabletStorage,
} from './tabletStorage'

/** Claves operativas CMSA (no incluye sesi?n ni idioma). */
export const CMSA_OPERATIONAL_KEYS = [
  BACKLOG_STORAGE_KEY,
  'cmsa-created-orders',
  ADMIN_PLANT_OVERRIDES_KEY,
  TABLET_OVERRIDES_KEY,
  TABLET_SNAPSHOTS_KEY,
  'cmsa-backlog-view-mode',
  'cmsa-backlog-density',
  'cmsa-cell-alarms',
  'cmsa-cell-alarms-version',
] as const

/** Referencias demo  id de cat?logo (28 naranjas). */
const DEMO_PRODUCT_REF_MAP: Record<string, string> = {
  'NAR-NAV-001': 'orange-002',
  'NAR-NAV-002': 'orange-003',
  'NAR-LAN-003': 'orange-011',
  'NAR-LAN-004': 'orange-012',
  'NAR-VAL-005': 'orange-020',
  'NAR-VAL-006': 'orange-021',
  'NAR-SAL-007': 'orange-019',
  'NAR-SAL-008': 'orange-019',
  'NAR-CAR-009': 'orange-009',
  'NAR-SAN-010': 'orange-024',
  'NAR-TAR-011': 'orange-025',
  'NAR-MID-012': 'orange-022',
}

function resolveDemoProduct(ref: string): MockProduct | undefined {
  const catalogId = DEMO_PRODUCT_REF_MAP[ref]
  if (catalogId) {
    return MOCK_PRODUCTS.find((p) => p.id === catalogId)
  }
  return MOCK_PRODUCTS.find((p) => p.referenciaProducto === ref)
}

function audit(action: string, user = 'Sistema'): BacklogOrder['auditTrail'][0] {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    timestamp: new Date().toISOString(),
    user,
  }
}

function validationTable(
  order: Pick<BacklogOrder, 'id' | 'reference' | 'company'>,
  plantTableId: string,
  type: ValidationTable['type'],
  status: ValidationTable['status'],
): ValidationTable {
  return {
    id: `${order.id}-${plantTableId}`,
    plantTableId,
    name: plantTableId,
    type,
    status,
    company: order.company,
    orderId: order.id,
    orderReference: order.reference,
  }
}

function baseOrder(
  partial: Omit<
    BacklogOrder,
    'auditTrail' | 'validationTables' | 'assignmentMode' | 'assignedTableIds' | 'assignedTables' | 'product' | 'productId' | 'productReference' | 'productName'
  > & {
    productRef: string
    product: string
    assignedTableIds?: string[]
    assignedTables?: string[]
    validationTables?: ValidationTable[]
    auditTrail?: BacklogOrder['auditTrail']
  },
): BacklogOrder {
  const catalog = resolveDemoProduct(partial.productRef)
  const assigned = partial.assignedTableIds ?? partial.assignedTables ?? []

  return {
    ...partial,
    product: 'Naranja',
    productId: catalog?.id,
    productReference: partial.productRef,
    productName: catalog?.nombre ?? `${partial.product} ${partial.variety}`,
    assignedTableIds: assigned,
    assignedTables: assigned,
    assignmentMode:
      assigned.length > 0
        ? assigned.some((id: string) => id.startsWith('M'))
          ? 'mixed'
          : 'automatic'
        : 'none',
    validationTables: partial.validationTables ?? [],
    auditTrail: partial.auditTrail ?? [audit('Objetivo creado'), audit('Objetivo demo cargado')],
  }
}

function buildDemoFullOrders(): BacklogOrder[] {
  const o1 = baseOrder({
    id: 'demo-1',
    company: 'SUMO',
    reference: 'DEMO-SUMO-001',
    productRef: 'NAR-NAV-001',
    product: 'Naranja',
    variety: 'Navelina',
    boxes: 1200,
    boxesPerHour: 500,
    column: 'en_backlog',
    eta: '15:30',
    endTime: '17:45',
    requiredTables: 2,
    tablesValidated: false,
    alerts: [],
    priority: 1,
  })

  const o2 = baseOrder({
    id: 'demo-2',
    company: 'SUMO',
    reference: 'DEMO-SUMO-002',
    productRef: 'NAR-LAN-003',
    product: 'Naranja',
    variety: 'Lane Late',
    boxes: 960,
    boxesPerHour: 420,
    column: 'en_backlog',
    eta: '16:00',
    endTime: '18:10',
    requiredTables: 2,
    tablesValidated: false,
    alerts: [],
    priority: 1,
  })

  const o3 = baseOrder({
    id: 'demo-3',
    company: 'MAF',
    reference: 'DEMO-MAF-001',
    productRef: 'NAR-VAL-005',
    product: 'Naranja',
    variety: 'Valencia Late',
    boxes: 1500,
    boxesPerHour: 600,
    column: 'en_backlog',
    eta: '14:45',
    endTime: '17:30',
    requiredTables: 2,
    tablesValidated: false,
    alerts: [],
    priority: 1,
  })

  const o4 = baseOrder({
    id: 'demo-4',
    company: 'MAF',
    reference: 'DEMO-MAF-002',
    productRef: 'NAR-SAL-008',
    product: 'Naranja',
    variety: 'Salustiana',
    boxes: 1800,
    boxesPerHour: 700,
    column: 'en_backlog',
    eta: '15:15',
    endTime: '18:00',
    requiredTables: 2,
    tablesValidated: false,
    alerts: [],
    priority: 1,
  })

  const o5Ref = {
    id: 'demo-5',
    company: 'SUMO' as const,
    reference: 'DEMO-SUMO-VAL-001',
  }
  const o5 = baseOrder({
    ...o5Ref,
    productRef: 'NAR-CAR-009',
    product: 'Naranja',
    variety: 'Cara Cara',
    boxes: 1300,
    boxesPerHour: 500,
    column: 'en_preparacion',
    eta: '13:50',
    endTime: '16:20',
    requiredTables: 3,
    assignedTableIds: ['R3', 'R8', 'M1'],
    tablesValidated: false,
    alerts: ['Mesas pendientes de validaci?n'],
    requiresManualTables: true,
    priority: 1,
    validationTables: [
      validationTable(o5Ref, 'R3', 'automatic', 'validada'),
      validationTable(o5Ref, 'R8', 'automatic', 'pendiente'),
      validationTable(o5Ref, 'M1', 'manual', 'pendiente'),
    ],
    auditTrail: [
      audit('Pedido creado'),
      audit('Enviado a validaci?n de mesas'),
    ],
  })

  const o6Ref = {
    id: 'demo-6',
    company: 'MAF' as const,
    reference: 'DEMO-MAF-VAL-001',
  }
  const o6 = baseOrder({
    ...o6Ref,
    productRef: 'NAR-SAN-010',
    product: 'Naranja',
    variety: 'Sanguinelli',
    boxes: 1100,
    boxesPerHour: 450,
    column: 'en_preparacion',
    eta: '14:10',
    endTime: '16:40',
    requiredTables: 2,
    assignedTableIds: ['R7', 'M6'],
    tablesValidated: false,
    alerts: ['Validaci?n pendiente'],
    requiresManualTables: true,
    priority: 1,
    validationTables: [
      validationTable(o6Ref, 'R7', 'automatic', 'pendiente'),
      validationTable(o6Ref, 'M6', 'manual', 'pendiente'),
    ],
    auditTrail: [
      audit('Pedido creado'),
      audit('Enviado a validaci?n de mesas'),
    ],
  })

  const o7 = baseOrder({
    id: 'demo-7',
    company: 'SUMO',
    reference: 'DEMO-SUMO-PROD-001',
    productRef: 'NAR-NAV-002',
    product: 'Naranja',
    variety: 'Navelina',
    boxes: 2000,
    boxesPerHour: 650,
    column: 'en_produccion',
    eta: '12:30',
    endTime: '15:45',
    requiredTables: 2,
    assignedTableIds: ['R1', 'R2'],
    tablesValidated: true,
    alerts: ['Producci?n m?s lenta de lo habitual'],
    priority: 1,
    auditTrail: [audit('Pedido creado'), audit('Mesas validadas'), audit('En ejecuci?n')],
  })

  const o8 = baseOrder({
    id: 'demo-8',
    company: 'MAF',
    reference: 'DEMO-MAF-PROD-001',
    productRef: 'NAR-VAL-006',
    product: 'Naranja',
    variety: 'Valencia Late',
    boxes: 1700,
    boxesPerHour: 580,
    column: 'en_produccion',
    eta: '11:45',
    endTime: '14:30',
    requiredTables: 2,
    assignedTableIds: ['R5', 'M4'],
    tablesValidated: true,
    alerts: ['Finalizaci?n prevista pr?xima'],
    priority: 1,
    auditTrail: [audit('Pedido creado'), audit('Mesas validadas'), audit('En ejecuci?n')],
  })

  const oAlm1 = baseOrder({
    id: 'bk-alm-1',
    company: 'SUMO',
    reference: 'ALM-SUMO-EXCESO-001',
    productRef: 'NAR-NAV-001',
    product: 'Naranja',
    variety: 'Navelina',
    boxes: 1250,
    boxesPerHour: 520,
    column: 'en_produccion',
    productionState: 'producing',
    eta: '12:45',
    endTime: '14:20',
    requiredTables: 2,
    assignedTableIds: ['R4'],
    tablesValidated: true,
    alerts: [
      'El objetivo est? enviando m?s cajas de las establecidas para la referencia.',
    ],
    priority: 1,
    auditTrail: [audit('Objetivo creado'), audit('En producci?n'), audit('Alarma: exceso de cajas')],
  })

  const oAlm2 = baseOrder({
    id: 'bk-alm-2',
    company: 'MAF',
    reference: 'ALM-MAF-FALTA-001',
    productRef: 'NAR-VAL-005',
    product: 'Naranja',
    variety: 'Valencia Late',
    boxes: 870,
    boxesPerHour: 480,
    column: 'en_produccion',
    productionState: 'temp_waiting',
    eta: '13:30',
    endTime: '15:10',
    requiredTables: 2,
    assignedTableIds: ['R6'],
    tablesValidated: true,
    alerts: [
      'El objetivo est? enviando menos cajas de las establecidas para la referencia.',
    ],
    priority: 1,
    auditTrail: [audit('Objetivo creado'), audit('En producci?n'), audit('Alarma: falta de cajas')],
  })

  const oAlm3 = baseOrder({
    id: 'bk-alm-3',
    company: 'SUMO',
    reference: 'ALM-SUMO-BLOQ-001',
    productRef: 'NAR-LAN-003',
    product: 'Naranja',
    variety: 'Lane Late',
    boxes: 1400,
    boxesPerHour: 500,
    column: 'en_produccion',
    productionState: 'element_blocked',
    eta: '16:00',
    endTime: '18:00',
    requiredTables: 2,
    assignedTableIds: ['M2'],
    tablesValidated: true,
    alerts: [
      'La celda asociada al objetivo est? bloqueada temporalmente por una incidencia.',
    ],
    priority: 1,
    auditTrail: [
      audit('Objetivo creado'),
      audit('En producci?n'),
      audit('Bloqueo por incidencia'),
    ],
  })

  return normalizePriorities([o1, o2, o3, o4, o5, o6, o7, o8, oAlm1, oAlm2, oAlm3])
}

function applyDemoFullPlantVisuals(
  tables: PlantTable[],
  palletizers: PlantPalletizerElement[],
): { plantTables: PlantTable[]; plantPalletizers: PlantPalletizerElement[] } {
  const plantTables = tables.map((table) => {
    if (table.id === 'R1' || table.id === 'R2') {
      return {
        ...table,
        speedStatus: 'slow' as const,
        alert: 'Producci?n m?s lenta de lo habitual',
      }
    }
    if (table.id === 'R5' || table.id === 'M4') {
      return {
        ...table,
        alert: table.orderId ? 'Finalizaci?n prevista pr?xima' : table.alert,
      }
    }
    if (table.id === 'R7' && !table.orderId) {
      return {
        ...table,
        status: 'waiting' as const,
        speedStatus: 'slow' as const,
        alert: 'En espera temporal',
      }
    }
    if (table.id === 'M3' && !table.orderId) {
      return {
        ...table,
        status: 'conflict' as const,
        alert: 'Revisi?n necesaria',
      }
    }
    return table
  })

  const plantPalletizers = palletizers.map((p) => {
    if (p.id === 'P2') {
      return { ...p, status: 'conflict' as const, alert: 'Conflicto SUMO/MAF' }
    }
    if (p.id === 'P5') {
      return { ...p, status: 'waiting' as const, alert: 'Cola de salida' }
    }
    if (p.id === 'P3') {
      return { ...p, status: 'active' as const, company: 'SUMO' as const }
    }
    if (p.id === 'P7') {
      return { ...p, status: 'active' as const, company: 'MAF' as const }
    }
    return p
  })

  return { plantTables, plantPalletizers }
}

/** Elimina datos operativos CMSA del localStorage (no auth ni idioma). */
export function clearCmsaLocalStorage(): void {
  CMSA_OPERATIONAL_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  })
}

/** Restaura usuarios, empresas, mesas base, paletizadores y config admin. */
export function seedBaseData(): void {
  resetAdminDataToSeed()
  clearAdminPlantOverrides()
  clearTabletStorage()
  clearCreatedOrders()
  clearBacklogViewPrefs()

  const state: CmsaPersistedState = {
    orders: [],
    plantTables: createCleanPlantTables(),
    plantPalletizers: createCleanPalletizers(),
  }
  saveState(state)
}

/** Demo limpia: sin pedidos ni estados temporales. */
export function resetDemoClean(): void {
  clearCmsaLocalStorage()
  seedBaseData()
  logSystemActivity('Demo limpia preparada', 'Reset operativo ? pedidos e incidencias eliminados', 'sistema')
}

/** Demo completa: escenario con pedidos, validaci?n, producci?n y avisos. */
export function seedDemoFull(): void {
  clearCmsaLocalStorage()
  resetCellAlarmsMock()
  resetAdminDataToSeed()
  clearAdminPlantOverrides()
  clearTabletStorage()
  clearCreatedOrders()
  clearBacklogViewPrefs()

  const orders = buildDemoFullOrders()
  let plantTables = rebuildPlantTablesFromOrders(createCleanPlantTables(), orders)
  let plantPalletizers = createCleanPalletizers()

  const visuals = applyDemoFullPlantVisuals(plantTables, plantPalletizers)
  plantTables = visuals.plantTables
  plantPalletizers = visuals.plantPalletizers

  saveState({ orders, plantTables, plantPalletizers })
  logSystemActivity(
    'Demo completa cargada',
    'Escenario simulado ? cola, validaci?n, producci?n y avisos',
    'sistema',
  )
}

declare global {
  interface Window {
    cmsaDemo?: {
      resetDemoClean: () => void
      seedDemoFull: () => void
      clearCmsaLocalStorage: () => void
      seedBaseData: () => void
    }
  }
}

export function registerDemoConsoleApi(): void {
  if (typeof window === 'undefined') return
  window.cmsaDemo = {
    resetDemoClean,
    seedDemoFull,
    clearCmsaLocalStorage,
    seedBaseData,
  }
}
