import { mockDailyOrders } from '../data/mockDailyOrders'
import { mockProductionOrders } from '../data/mockBacklogOrders'
import { resetCellAlarmsMock } from '../data/mockCellAlarms'
import {
  createCleanPalletizers,
  createCleanPlantTables,
} from '../data/mockPlantTables'
import type { CmsaPersistedState, PlantPalletizerElement, PlantTable } from '../types/plant'
import { resetAdminDataToSeed } from './adminStorage'
import { ADMIN_PLANT_OVERRIDES_KEY, clearAdminPlantOverrides } from './adminPlantOverrides'
import { BACKLOG_STORAGE_KEY, normalizePriorities, saveState } from './backlogStorage'
import { syncAllDailyOrders } from './dailyOrderHelpers'
import { clearBacklogViewPrefs } from './backlogViewPrefs'
import { logSystemActivity } from './activityLog'
import { clearCreatedOrders } from './orderStorage'
import { rebuildPlantTablesFromOrders } from './plantSync'
import {
  TABLET_OVERRIDES_KEY,
  TABLET_SNAPSHOTS_KEY,
  clearTabletStorage,
} from './tabletStorage'

/** Claves operativas CMSA (no incluye sesión ni idioma). */
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

function applyDemoFullPlantVisuals(
  tables: PlantTable[],
  palletizers: PlantPalletizerElement[],
): { plantTables: PlantTable[]; plantPalletizers: PlantPalletizerElement[] } {
  const plantTables = tables.map((table) => {
    if (table.id === 'R1' || table.id === 'R2') {
      return {
        ...table,
        speedStatus: 'slow' as const,
        alert: 'Producción más lenta de lo habitual',
      }
    }
    if (table.id === 'R5' || table.id === 'M4') {
      return {
        ...table,
        alert: table.orderId ? 'Finalización prevista próxima' : table.alert,
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
    if (table.id === 'M2' && table.orderId) {
      return {
        ...table,
        status: 'blocked' as const,
        alert: 'Bloqueo por ocupación',
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
    dailyOrders: syncAllDailyOrders([...mockDailyOrders], []),
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
  logSystemActivity('Demo limpia preparada', 'Reset operativo — pedidos e incidencias eliminados', 'sistema')
}

/** Demo completa: escenario con pedidos, validación, producción y avisos. */
export function seedDemoFull(): void {
  clearCmsaLocalStorage()
  resetCellAlarmsMock()
  resetAdminDataToSeed()
  clearAdminPlantOverrides()
  clearTabletStorage()
  clearCreatedOrders()
  clearBacklogViewPrefs()

  const orders = normalizePriorities([...mockProductionOrders])
  let plantTables = rebuildPlantTablesFromOrders(createCleanPlantTables(), orders)
  let plantPalletizers = createCleanPalletizers()

  const visuals = applyDemoFullPlantVisuals(plantTables, plantPalletizers)
  plantTables = visuals.plantTables
  plantPalletizers = visuals.plantPalletizers

  saveState({
    dailyOrders: syncAllDailyOrders([...mockDailyOrders], orders),
    orders,
    plantTables,
    plantPalletizers,
  })
  logSystemActivity(
    'Demo completa cargada',
    'Escenario simulado — cola, validación, producción y avisos',
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
