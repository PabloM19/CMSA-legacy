import type {
  PlantPalletizerStatus,
  PlantTableStatus,
} from '../types/plant'

export const TABLET_OVERRIDES_KEY = 'cmsa-tablet-overrides'
export const TABLET_SNAPSHOTS_KEY = 'cmsa-tablet-snapshots'

export interface TabletElementOverride {
  status: PlantTableStatus | PlantPalletizerStatus
  alert: string | null
}

export interface TabletElementSnapshot {
  status: PlantTableStatus | PlantPalletizerStatus
  alert: string | null
}

type OverrideMap = Record<string, TabletElementOverride>
type SnapshotMap = Record<string, TabletElementSnapshot>

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function readTabletOverrides(): OverrideMap {
  return readJson<OverrideMap>(TABLET_OVERRIDES_KEY, {})
}

export function readTabletSnapshots(): SnapshotMap {
  return readJson<SnapshotMap>(TABLET_SNAPSHOTS_KEY, {})
}

export function saveTabletOverrides(overrides: OverrideMap): void {
  localStorage.setItem(TABLET_OVERRIDES_KEY, JSON.stringify(overrides))
}

export function saveTabletSnapshots(snapshots: SnapshotMap): void {
  localStorage.setItem(TABLET_SNAPSHOTS_KEY, JSON.stringify(snapshots))
}

export function setTabletOverride(id: string, override: TabletElementOverride): void {
  const overrides = readTabletOverrides()
  overrides[id] = override
  saveTabletOverrides(overrides)
}

export function clearTabletOverride(id: string): void {
  const overrides = readTabletOverrides()
  delete overrides[id]
  saveTabletOverrides(overrides)
}

export function setTabletSnapshot(id: string, snapshot: TabletElementSnapshot): void {
  const snapshots = readTabletSnapshots()
  snapshots[id] = snapshot
  saveTabletSnapshots(snapshots)
}

export function clearTabletSnapshot(id: string): void {
  const snapshots = readTabletSnapshots()
  delete snapshots[id]
  saveTabletSnapshots(snapshots)
}
