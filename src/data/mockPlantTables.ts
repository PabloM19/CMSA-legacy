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

/** Overrides visuales para mesas sin pedido (demo estable, no cambia al recargar). */
export const PLANT_TABLE_DEMO_OVERRIDES: Record<
  string,
  Partial<Pick<PlantTable, 'status' | 'speedStatus' | 'alert'>>
> = {
  R4: { speedStatus: 'normal' },
  R5: { status: 'waiting', speedStatus: 'slow', alert: 'Espera de material' },
  R6: { speedStatus: 'normal' },
  R7: { speedStatus: 'normal' },
  R8: { speedStatus: 'normal' },
  R9: { speedStatus: 'normal' },
}

export function applyUnassignedTableDemos(tables: PlantTable[]): PlantTable[] {
  return tables.map((table) => {
    if (table.orderId) return table
    const demo = PLANT_TABLE_DEMO_OVERRIDES[table.id]
    if (!demo) return table
    return { ...table, ...demo }
  })
}

/** Mesas base libres — demo limpia sin pedidos asignados. */
export function createCleanPlantTables(): PlantTable[] {
  const automatic = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9'].map((id) => ({
    id,
    name: id,
    type: 'automatic' as const,
    status: 'free' as const,
    company: null,
    orderId: null,
    speedStatus: 'normal' as const,
    alert: null,
  }))
  const manual = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'].map((id) => ({
    id,
    name: id,
    type: 'manual' as const,
    status: 'free' as const,
    company: null,
    orderId: null,
    speedStatus: null,
    alert: null,
  }))
  return [...automatic, ...manual]
}

/** Estado inicial legacy de planta (referencia histórica). */
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

/** Paletizadores P1-P8 en estado base (inactivos, sin alertas). */
export function createCleanPalletizers(): PlantPalletizerElement[] {
  return ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'].map((id) => palletizer(id))
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
