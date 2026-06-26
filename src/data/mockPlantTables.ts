import type { PlantTable } from '../types/plant'

function auto(id: string, overrides: Partial<PlantTable> = {}): PlantTable {
  return {
    id,
    name: id,
    type: 'automatic',
    status: 'free',
    company: null,
    orderId: null,
    speedStatus: 'normal',
    alert: null,
    ...overrides,
  }
}

function manual(id: string, overrides: Partial<PlantTable> = {}): PlantTable {
  return {
    id,
    name: id,
    type: 'manual',
    status: 'free',
    company: null,
    orderId: null,
    speedStatus: null,
    alert: null,
    ...overrides,
  }
}

/** Estado inicial de la planta mock (R1-R9, M1-M7). */
export function createSeedPlantTables(): PlantTable[] {
  return [
    auto('R1', { status: 'pending_validation', company: 'SUMO', orderId: 'bk-3' }),
    auto('R2', { status: 'pending_validation', company: 'SUMO', orderId: 'bk-3' }),
    auto('R3', { status: 'occupied', company: 'MAF', orderId: 'bk-4', speedStatus: 'fast' }),
    auto('R4', { status: 'free' }),
    auto('R5', { status: 'waiting', alert: 'Espera de material' }),
    auto('R6', { status: 'free' }),
    auto('R7', { status: 'free' }),
    auto('R8', { status: 'free' }),
    auto('R9', { status: 'free' }),
    manual('M1', { status: 'pending_validation', company: 'SUMO', orderId: 'bk-3' }),
    manual('M2', { status: 'free' }),
    manual('M3', { status: 'free' }),
    manual('M4', { status: 'free' }),
    manual('M5', { status: 'blocked', company: 'SUMO', orderId: 'bk-5', alert: 'Incidencia material' }),
    manual('M6', { status: 'free' }),
    manual('M7', { status: 'free' }),
  ]
}
