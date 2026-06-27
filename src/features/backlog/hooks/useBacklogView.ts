import { useCallback, useEffect, useState } from 'react'
import {
  loadNormalizedViewPrefs,
  normalizeDensityForMode,
  saveDensity,
  saveViewMode,
  type BacklogDensity,
  type BacklogViewMode,
} from '../../../utils/backlogViewPrefs'

const SKELETON_MS = 400

export function useBacklogView() {
  const [viewMode, setViewMode] = useState<BacklogViewMode>(
    () => loadNormalizedViewPrefs().viewMode,
  )
  const [density, setDensity] = useState<BacklogDensity>(
    () => loadNormalizedViewPrefs().density,
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const { viewMode: mode, density: normalized } = loadNormalizedViewPrefs()
    saveViewMode(mode)
    saveDensity(normalized)
    setViewMode(mode)
    setDensity(normalized)
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
