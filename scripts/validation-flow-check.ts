/**
 * Simulación del flujo de asignación R/M + validación.
 * Ejecutar: npx tsx scripts/validation-flow-check.ts
 */
import { mockBacklogOrders } from '../src/data/mockBacklogOrders'
import { createSeedPlantTables } from '../src/data/mockPlantTables'
import { executeColumnMove } from '../src/utils/backlogMove'
import { BACKLOG_STORAGE_KEY } from '../src/utils/backlogStorage'
import { rebuildPlantTablesFromOrders } from '../src/utils/plantSync'
import {
  canStartProduction,
  getPendingValidationOrders,
  getTableStats,
  hasTableConflicts,
  markTableConflict,
  normalizeOrdersValidation,
  resolveTableConflict,
  validateAllTables,
  validateSingleTable,
} from '../src/utils/validationHelpers'

const storage = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
})

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`)
}

function log(msg: string) {
  console.log(`✓ ${msg}`)
}

storage.clear()
let orders = normalizeOrdersValidation([...mockBacklogOrders])
let plantTables = rebuildPlantTablesFromOrders(createSeedPlantTables(), orders)

const sumoOrder = orders.find((o) => o.id === 'bk-1')!
const move0 = executeColumnMove(orders, plantTables, sumoOrder, 'pendiente_validacion', 'usuario_sumo', 'es')
assert(move0.success, 'Test 0: asignación a validación')
assert((move0.movedOrder?.assignedTableIds.length ?? 0) > 0, 'Test 0: mesas R/M asignadas')
orders = move0.orders
plantTables = move0.plantTables
log('Test 0 — pedido SUMO con mesas R/M')

let order = orders.find((o) => o.id === 'bk-3')!
const table1 = order.validationTables[0].id
;({ order, plantTables } = validateSingleTable(order, table1, 'validador', 'es', plantTables))
assert(getTableStats(order).validated === 1, 'Test B: 1/3')
log('Test B — validar mesa individual')

assert(!canStartProduction(order), 'Test C: bloqueo parcial')
log('Test C — no iniciar con pendientes')

const table2 = order.validationTables.find((t) => t.status === 'pendiente')!.id
;({ order, plantTables } = markTableConflict(order, table2, 'Mock', 'validador', 'es', plantTables))
assert(hasTableConflicts(order), 'Test D: conflicto')
log('Test D — conflicto')

;({ order, plantTables } = resolveTableConflict(order, table2, 'validador', 'es', plantTables))
;({ order, plantTables } = validateSingleTable(order, table2, 'validador', 'es', plantTables))
log('Test E — resolver y validar')

;({ order, plantTables } = validateAllTables(order, 'validador', 'es', plantTables))
assert(canStartProduction(order), 'Test F: listo')
log('Test F — validar todas')

const start = executeColumnMove(orders, plantTables, order, 'en_ejecucion', 'validador', 'es')
orders = start.orders
assert(!getPendingValidationOrders(orders).some((o) => o.id === 'bk-3'), 'Test G: fuera de validation')
log('Test G — iniciar producción')

storage.set(
  BACKLOG_STORAGE_KEY,
  JSON.stringify({ orders, plantTables: start.plantTables }),
)
log('Test J — persistencia OK')

console.log('\nTodos los checks pasaron.')
