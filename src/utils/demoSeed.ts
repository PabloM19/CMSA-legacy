import { mockProductionOrders } from '../data/mockBacklogOrders'
import { resetCellAlarmsMock } from '../data/mockCellAlarms'
import {
  DEMO_SCENARIO_VERSION,
  buildCleanDemoState,
  buildFullDemoState,
} from '../data/demoScenario'
import { resetAdminDataToSeed } from './adminStorage'
import { ADMIN_PLANT_OVERRIDES_KEY, clearAdminPlantOverrides } from './adminPlantOverrides'
import { BACKLOG_STORAGE_KEY, normalizePriorities, saveState } from './backlogStorage'
import { buildSyncedDailyOrders } from './dailyOrderHelpers'
import { clearBacklogViewPrefs } from './backlogViewPrefs'
import { logSystemActivity } from './activityLog'
import { clearCreatedOrders } from './orderStorage'
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

  const dailyOrders = buildSyncedDailyOrders([])
  const state = buildCleanDemoState(dailyOrders)
  saveState(state)
}

/** Demo limpia: pedidos del día base sin órdenes de producción. */
export function resetDemoClean(): void {
  clearCmsaLocalStorage()
  seedBaseData()
  logSystemActivity('Demo limpia preparada', 'Reset operativo — pedidos e incidencias eliminados', 'sistema')
}

/** Demo completa: escenario coherente centralizado. */
export function seedDemoFull(): void {
  clearCmsaLocalStorage()
  resetCellAlarmsMock()
  resetAdminDataToSeed()
  clearAdminPlantOverrides()
  clearTabletStorage()
  clearCreatedOrders()
  clearBacklogViewPrefs()

  const orders = normalizePriorities([...mockProductionOrders])
  const dailyOrders = buildSyncedDailyOrders(orders)
  const state = buildFullDemoState(dailyOrders, orders)

  saveState(state)
  logSystemActivity(
    'Demo completa cargada',
    `Escenario demo v${DEMO_SCENARIO_VERSION} — pedidos, órdenes, mapa y eventos alineados`,
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
