import { useCallback, useEffect, useState } from 'react'
import {
  normalizeDensityForMode,
  saveDensity,
  saveViewMode,
  type BacklogDensity,
  type BacklogViewMode,
} from '../../../utils/backlogViewPrefs'

const SKELETON_MS = 400

const DEFAULT_VIEW_MODE: BacklogViewMode = 'summary'
const DEFAULT_DENSITY: BacklogDensity = 2

/** Al entrar en cola diaria siempre arranca en resumen (2 por columna). */
function initialViewPrefs(): { viewMode: BacklogViewMode; density: BacklogDensity } {
  return {
    viewMode: DEFAULT_VIEW_MODE,
    density: DEFAULT_DENSITY,
  }
}

export function useBacklogView() {
  const [viewMode, setViewMode] = useState<BacklogViewMode>(DEFAULT_VIEW_MODE)
  const [density, setDensity] = useState<BacklogDensity>(DEFAULT_DENSITY)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const { viewMode: mode, density: normalized } = initialViewPrefs()
    setViewMode(mode)
    setDensity(normalized)
    saveViewMode(mode)
    saveDensity(normalized)
  }, [])

  const withSkeleton = useCallback((apply: () => void) => {
    setIsLoading(true)
    apply()
    window.setTimeout(() => setIsLoading(false), SKELETON_MS)
  }, [])

  const changeViewMode = useCallback(
    (mode: BacklogViewMode) => {
      withSkeleton(() => {
        setViewMode(mode)
        saveViewMode(mode)
        if (mode === 'full') {
          setDensity('all')
          saveDensity('all')
          return
        }
        setDensity((current) => {
          const next = normalizeDensityForMode(mode, current)
          saveDensity(next)
          return next
        })
      })
    },
    [withSkeleton],
  )

  const changeDensity = useCallback(
    (next: BacklogDensity) => {
      if (next === 'all') {
        changeViewMode('full')
        return
      }
      if (viewMode === 'full') return
      withSkeleton(() => {
        setDensity(next)
        saveDensity(next)
      })
    },
    [viewMode, withSkeleton, changeViewMode],
  )

  return {
    viewMode,
    density,
    isLoading,
    changeViewMode,
    changeDensity,
    densityDisabled: viewMode === 'full',
  }
}
