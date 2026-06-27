export type BacklogViewMode = 'summary' | 'full' | 'attention' | 'mine'
export type BacklogDensity = 2 | 4 | 'all'

const VIEW_MODE_KEY = 'cmsa-backlog-view-mode'
const DENSITY_KEY = 'cmsa-backlog-density'

export function loadViewMode(): BacklogViewMode {
  try {
    const raw = localStorage.getItem(VIEW_MODE_KEY)
    if (raw === 'summary' || raw === 'full' || raw === 'attention' || raw === 'mine') return raw
  } catch {
    /* ignore */
  }
  return 'summary'
}

export function saveViewMode(mode: BacklogViewMode): void {
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode)
  } catch {
    /* ignore */
  }
}

export function loadDensity(): BacklogDensity {
  try {
    const raw = localStorage.getItem(DENSITY_KEY)
    if (raw === '2') return 2
    if (raw === '4') return 4
    if (raw === 'all') return 'all'
  } catch {
    /* ignore */
  }
  return 2
}

export function saveDensity(density: BacklogDensity): void {
  try {
    localStorage.setItem(DENSITY_KEY, String(density))
  } catch {
    /* ignore */
  }
}

export function isCompactViewMode(viewMode: BacklogViewMode): boolean {
  return viewMode !== 'full'
}

/** Ajusta densidad guardada al modo activo (Resumen nunca usa "Todos"). */
export function normalizeDensityForMode(
  viewMode: BacklogViewMode,
  density: BacklogDensity,
): BacklogDensity {
  if (viewMode === 'full') return 'all'
  if (density === 'all') return 2
  return density
}

export function resolveVisibleLimit(
  viewMode: BacklogViewMode,
  density: BacklogDensity,
): number | null {
  if (viewMode === 'full') return null
  const normalized = normalizeDensityForMode(viewMode, density)
  return normalized === 4 ? 4 : 2
}

export function loadNormalizedViewPrefs(): {
  viewMode: BacklogViewMode
  density: BacklogDensity
} {
  const viewMode = loadViewMode()
  const density = normalizeDensityForMode(viewMode, loadDensity())
  return { viewMode, density }
}
