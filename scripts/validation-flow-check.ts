/**
 * Simulación manual del plan de pruebas de /validation (sin UI).
 * Ejecutar: npx tsx scripts/validation-flow-check.ts
 */
import { mockBacklogOrders } from '../src/data/mockBacklogOrders'
import { applyColumnMove } from '../src/utils/backlogRules'
import { saveOrders, getOrders, BACKLOG_STORAGE_KEY } from '../src/utils/backlogStorage'
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

const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storage.set(key, value)
  },
  removeItem: (key: string) => storage.delete(key),
}

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`)
}

function log(msg: string) {
  console.log(`✓ ${msg}`)
}

// Reset storage
storage.clear()

// Test 0: mover pedido SUMO a pendiente_validacion
let orders = normalizeOrdersValidation([...mockBacklogOrders])
const sumoOrder = orders.find((o) => o.id === 'bk-1')!
const movedToValidation = applyColumnMove(sumoOrder, 'pendiente_validacion', 'usuario_sumo')
orders = orders.map((o) => (o.id === sumoOrder.id ? movedToValidation : o))
saveOrders(orders)

let loaded = getOrders()
let pending = getPendingValidationOrders(loaded)
assert(pending.some((o) => o.id === 'bk-1'), 'Test 0: pedido SUMO en pendiente_validacion')
assert(
  (pending.find((o) => o.id === 'bk-1')?.validationTables.length ?? 0) > 0,
  'Test 0: mesas mock asignadas',
)
log('Test 0 — pedido preparado con mesas')

// Usar bk-3 (3 mesas) para tests B-G
let order = loaded.find((o) => o.id === 'bk-3')!
assert(order.column === 'pendiente_validacion', 'bk-3 en validación')
assert(getTableStats(order).total === 3, 'bk-3 tiene 3 mesas')

// Test B
const table1 = order.validationTables[0].id
order = validateSingleTable(order, table1, 'usuario_validador', 'es')
assert(getTableStats(order).validated === 1, 'Test B: 1/3 validada')
assert(order.validationTables[0].status === 'validada', 'Test B: mesa Validada')
log('Test B — validar mesa individual')

// Test C
assert(!canStartProduction(order), 'Test C: no puede iniciar producción')
log('Test C — bloqueo con mesas pendientes (canStartProduction=false)')

// Test D
const table2 = order.validationTables.find((t) => t.status === 'pendiente')!.id
order = markTableConflict(order, table2, 'Conflicto operativo simulado', 'usuario_validador', 'es')
assert(hasTableConflicts(order), 'Test D: hay conflicto')
assert(!canStartProduction(order), 'Test D: no puede iniciar con conflicto')
log('Test D — marcar conflicto bloquea producción')

// Test E
order = resolveTableConflict(order, table2, 'usuario_validador', 'es')
assert(order.validationTables.find((t) => t.id === table2)?.status === 'pendiente', 'Test E: vuelve a Pendiente')
order = validateSingleTable(order, table2, 'usuario_validador', 'es')
assert(getTableStats(order).validated === 2, 'Test E: contador tras resolver y validar')
log('Test E — resolver conflicto y validar')

// Test F
order = validateAllTables(order, 'usuario_validador', 'es')
assert(getTableStats(order).validated === 3, 'Test F: 3/3 validadas')
assert(canStartProduction(order), 'Test F: puede iniciar producción')
log('Test F — validar todas')

// Test G
const started = applyColumnMove(order, 'en_ejecucion', 'usuario_validador')
orders = loaded.map((o) => (o.id === order.id ? started : o))
saveOrders(orders)
loaded = getOrders()
pending = getPendingValidationOrders(loaded)
assert(!pending.some((o) => o.id === 'bk-3'), 'Test G: desaparece de validation')
const inExec = loaded.find((o) => o.id === 'bk-3')
assert(inExec?.column === 'en_ejecucion', 'Test G: pasa a en_ejecucion')
log('Test G — iniciar producción')

// Test J persistencia
storage.set(BACKLOG_STORAGE_KEY, JSON.stringify(loaded))
const reloaded = getOrders()
const reloadedOrder = reloaded.find((o) => o.id === 'bk-3')
assert(reloadedOrder?.column === 'en_ejecucion', 'Test J: persiste en ejecución tras reload')
assert(getPendingValidationOrders(reloaded).every((o) => o.id !== 'bk-3'), 'Test J: no en validation tras reload')
log('Test J — persistencia tras reload')

console.log('\nTodos los checks de lógica pasaron.')
