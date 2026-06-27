import type { Lang } from '../i18n/translations'
import type { CmsaPersistedState, PlantElementView } from '../types/plant'
import {
  clearTabletOverride,
  clearTabletSnapshot,
  readTabletSnapshots,
  setTabletOverride,
  setTabletSnapshot,
} from './tabletStorage'

function incidentAlert(lang: Lang): string {
  return lang === 'es' ? 'Incidencia operativa (tablet)' : 'Operational incident (tablet)'
}

function stopAlert(lang: Lang): string {
  return lang === 'es' ? 'Parada simulada desde tablet' : 'Simulated stop from tablet'
}

export function markTabletIncident(
  state: CmsaPersistedState,
  element: PlantElementView,
  lang: Lang,
): CmsaPersistedState {
  const alert = incidentAlert(lang)
  setTabletOverride(element.id, { status: 'conflict', alert })

  return patchStateElement(state, element.id, element.type, 'conflict', alert)
}

export function simulateTabletStop(
  state: CmsaPersistedState,
  element: PlantElementView,
  lang: Lang,
): CmsaPersistedState {
  setTabletSnapshot(element.id, {
    status: element.status,
    alert: element.alert,
  })
  const alert = stopAlert(lang)
  setTabletOverride(element.id, { status: 'blocked', alert })

  return patchStateElement(state, element.id, element.type, 'blocked', alert)
}

export function simulateTabletResume(
  state: CmsaPersistedState,
  element: PlantElementView,
): CmsaPersistedState {
  const snapshots = readTabletSnapshots()
  const snapshot = snapshots[element.id]

  if (snapshot) {
    setTabletOverride(element.id, {
      status: snapshot.status,
      alert: snapshot.alert,
    })
    clearTabletSnapshot(element.id)
    const next = patchStateElement(
      state,
      element.id,
      element.type,
      snapshot.status,
      snapshot.alert,
    )
    if (
      snapshot.status === element.status &&
      snapshot.alert === element.alert
    ) {
      clearTabletOverride(element.id)
    }
    return next
  }

  clearTabletOverride(element.id)
  clearTabletSnapshot(element.id)
  return state
}

function patchStateElement(
  state: CmsaPersistedState,
  id: string,
  type: PlantElementView['type'],
  status: PlantElementView['status'],
  alert: string | null,
): CmsaPersistedState {
  if (type === 'palletizer') {
    return {
      ...state,
      plantPalletizers: state.plantPalletizers.map((p) =>
        p.id === id ? { ...p, status: status as typeof p.status, alert } : p,
      ),
    }
  }

  return {
    ...state,
    plantTables: state.plantTables.map((t) =>
      t.id === id ? { ...t, status: status as typeof t.status, alert } : t,
    ),
  }
}
