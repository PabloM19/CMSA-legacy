/**
 * Checks del pictograma /plant-map y sincronización con backlog/validation.
 * Ejecutar: npx tsx scripts/plant-map-check.ts
 */
import { PLANT_LOWER_ROW, PLANT_UPPER_ROW } from '../src/data/plantLayout'
import { mockBacklogOrders } from '../src/data/mockBacklogOrders'
import { createSeedPalletizers, createSeedPlantTables } from '../src/data/mockPlantTables'
import { executeColumnMove } from '../src/utils/backlogMove'
import { getState, saveState } from '../src/utils/backlogStorage'
import { buildPlantElementMap } from '../src/utils/plantMapHelpers'
import { canAccessRoute } from '../src/utils/permissions'
import { rebuildPlantTablesFromOrders } from '../src/utils/plantSync'
import {
  normalizeOrdersValidation,
  validateAllTables,
} from '../src/utils/validationHelpers'
import type { User } from '../src/types/auth'

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
saveState({ orders, plantTables, plantPalletizers: createSeedPalletizers() })

assert(PLANT_UPPER_ROW.join(' ') === 'M3 M2 M1 R9 R8 R7 R6 R5 R4 R3 R2 R1', 'orden fila superior')
assert(PLANT_LOWER_ROW.join(' ') === 'M7 M6 M5 M4 P8 P7 P6 P5 P4 P3 P2 P1', 'orden fila inferior')
log('Test B — orden del plano')

const initial = getState()
const map1 = buildPlantElementMap(initial.plantTables, initial.plantPalletizers, initial.orders, 'es')

assert(map1.get('R3')?.status === 'occupied', 'R3 ocupada (MAF en ejecución)')
assert(map1.get('R3')?.company === 'MAF', 'R3 borde MAF')
assert(map1.get('R1')?.status === 'waiting', 'R1 en espera temporal')
assert(map1.get('M1')?.status === 'waiting', 'M1 manual en espera temporal')
assert(map1.get('M5')?.status === 'blocked', 'M5 bloqueada')
assert(map1.get('R5')?.status === 'waiting', 'R5 en espera (demo estable)')
assert(map1.get('P5')?.status === 'waiting', 'P5 paletizador en espera')
log('Test D/E — estados visibles iniciales')

const r3Before = getState().plantTables.find((t) => t.id === 'R3')!
saveState(getState())
const r3After = getState().plantTables.find((t) => t.id === 'R3')!
assert(r3Before.status === r3After.status && r3Before.orderId === r3After.orderId, 'Test J — estable al recargar')
log('Test J — persistencia estable')

let state = getState()
const sumoOrder = state.orders.find((o) => o.id === 'bk-1')!
let move = executeColumnMove(state.orders, state.plantTables, sumoOrder, 'pendiente_lanzamiento', 'usuario_sumo', 'es')
assert(move.success, 'mover a lanzamiento')
move = executeColumnMove(move.orders, move.plantTables, move.movedOrder!, 'pendiente_validacion', 'usuario_sumo', 'es')
assert(move.success, 'Test K — mover a validación')
saveState({ ...state, orders: move.orders, plantTables: move.plantTables })
const assigned = move.movedOrder!.assignedTableIds
const synced = getState()
assigned.forEach((id) => {
  const table = synced.plantTables.find((t) => t.id === id)!
  assert(table.status === 'waiting', `${id} en espera temporal en mapa`)
  assert(table.company === 'SUMO', `${id} empresa SUMO`)
})
log(`Test K — backlog → mapa (${assigned.join(', ')})`)

state = getState()
let order = state.orders.find((o) => o.id === 'bk-3')!
;({ order, plantTables: state.plantTables } = validateAllTables(order, 'validador', 'es', state.plantTables))
move = executeColumnMove(state.orders, state.plantTables, order, 'en_ejecucion', 'validador', 'es')
assert(move.success, 'iniciar producción bk-3')
saveState({ orders: move.orders, plantTables: move.plantTables, plantPalletizers: state.plantPalletizers })
const afterProd = getState()
;['R1', 'R2', 'M1'].forEach((id) => {
  const table = afterProd.plantTables.find((t) => t.id === id)!
  assert(table.status === 'occupied', `${id} ocupada tras producción`)
})
const view = buildPlantElementMap(afterProd.plantTables, afterProd.plantPalletizers, afterProd.orders, 'es')
assert(view.get('M1')?.orderReference === 'PED-240622-03', 'M1 muestra pedido en drawer data')
log('Test L/M — validation → producción → mapa')

const validator: User = {
  username: 'usuario_validador',
  name: 'Validador',
  company: 'CMSA',
  role: 'validator',
}
assert(canAccessRoute(validator, '/plant-map'), 'Test N — validador puede ver mapa')
log('Test N — permisos consulta mapa')

console.log('\nTodos los checks del pictograma pasaron.')
