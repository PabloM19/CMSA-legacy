import type { OrderCompany } from '../types/newOrder'
import type { PlantTable, PlantTableStatus, PlantTableType } from '../types/plant'

export const ADMIN_PLANT_OVERRIDES_KEY = 'cmsa-admin-plant-overrides'

export interface AdminPlantTableOverride {
  name?: string
  type?: PlantTableType
  status?: PlantTableStatus
  company?: OrderCompany | null
  orderId?: string | null
  alert?: string | null
}

type OverrideMap = Record<string, AdminPlantTableOverride>

function readJson(): OverrideMap {
  try {
    const raw = localStorage.getItem(ADMIN_PLANT_OVERRIDES_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as OverrideMap
  } catch {
    return {}
  }
}

export function readAdminPlantOverrides(): OverrideMap {
  return readJson()
}

export function setAdminPlantOverride(id: string, patch: AdminPlantTableOverride): void {
  const overrides = readJson()
  overrides[id] = { ...overrides[id], ...patch }
  localStorage.setItem(ADMIN_PLANT_OVERRIDES_KEY, JSON.stringify(overrides))
}

export function clearAdminPlantOverride(id: string): void {
  const overrides = readJson()
  delete overrides[id]
  localStorage.setItem(ADMIN_PLANT_OVERRIDES_KEY, JSON.stringify(overrides))
}

export function clearAdminPlantOverrides(): void {
  localStorage.removeItem(ADMIN_PLANT_OVERRIDES_KEY)
}

export function applyAdminPlantOverrides(tables: PlantTable[]): PlantTable[] {
  const overrides = readAdminPlantOverrides()
  if (Object.keys(overrides).length === 0) return tables

  return tables.map((table) => {
    const override = overrides[table.id]
    if (!override) return table
    return { ...table, ...override }
  })
}
