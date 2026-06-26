import type { PlantPalletizerElement, PlantTable } from '../types/plant'

function palletizer(id: string, overrides: Partial<PlantPalletizerElement> = {}): PlantPalletizerElement {
  return {
    id,
    name: id,
    type: 'palletizer',
    status: 'idle',
    company: null,
    orderId: null,
    alert: null,
    ...overrides,
  }
}

/** Estado inicial de la planta mock (R1-R9, M1-M7). */
export function createSeedPlantTables(): PlantTable[] {
  return [
    { id: 'R1', name: 'R1', type: 'automatic', status: 'pending_validation', company: 'SUMO', orderId: 'bk-3', speedStatus: 'normal', alert: null },
    { id: 'R2', name: 'R2', type: 'automatic', status: 'pending_validation', company: 'SUMO', orderId: 'bk-3', speedStatus: 'normal', alert: null },
    { id: 'R3', name: 'R3', type: 'automatic', status: 'occupied', company: 'MAF', orderId: 'bk-4', speedStatus: 'fast', alert: null },
    { id: 'R4', name: 'R4', type: 'automatic', status: 'free', company: null, orderId: null, speedStatus: 'normal', alert: null },
    { id: 'R5', name: 'R5', type: 'automatic', status: 'waiting', company: null, orderId: null, speedStatus: 'slow', alert: 'Espera de material' },
    { id: 'R6', name: 'R6', type: 'automatic', status: 'free', company: null, orderId: null, speedStatus: 'normal', alert: null },
    { id: 'R7', name: 'R7', type: 'automatic', status: 'free', company: null, orderId: null, speedStatus: 'normal', alert: null },
    { id: 'R8', name: 'R8', type: 'automatic', status: 'free', company: null, orderId: null, speedStatus: 'normal', alert: null },
    { id: 'R9', name: 'R9', type: 'automatic', status: 'free', company: null, orderId: null, speedStatus: 'normal', alert: null },
    { id: 'M1', name: 'M1', type: 'manual', status: 'pending_validation', company: 'SUMO', orderId: 'bk-3', speedStatus: null, alert: null },
    { id: 'M2', name: 'M2', type: 'manual', status: 'free', company: null, orderId: null, speedStatus: null, alert: null },
    { id: 'M3', name: 'M3', type: 'manual', status: 'free', company: null, orderId: null, speedStatus: null, alert: null },
    { id: 'M4', name: 'M4', type: 'manual', status: 'free', company: null, orderId: null, speedStatus: null, alert: null },
    { id: 'M5', name: 'M5', type: 'manual', status: 'blocked', company: 'SUMO', orderId: 'bk-5', speedStatus: null, alert: 'Incidencia material' },
    { id: 'M6', name: 'M6', type: 'manual', status: 'free', company: null, orderId: null, speedStatus: null, alert: null },
    { id: 'M7', name: 'M7', type: 'manual', status: 'free', company: null, orderId: null, speedStatus: null, alert: null },
  ]
}

/** Paletizadores P1-P8 — fila secundaria, estados mock estables. */
export function createSeedPalletizers(): PlantPalletizerElement[] {
  return [
    palletizer('P1', { status: 'active', company: 'MAF' }),
    palletizer('P2', { status: 'idle' }),
    palletizer('P3', { status: 'active', company: 'SUMO' }),
    palletizer('P4', { status: 'idle' }),
    palletizer('P5', { status: 'waiting', alert: 'Cola de salida' }),
    palletizer('P6', { status: 'idle' }),
    palletizer('P7', { status: 'active', company: 'MAF' }),
    palletizer('P8', { status: 'idle' }),
  ]
}
