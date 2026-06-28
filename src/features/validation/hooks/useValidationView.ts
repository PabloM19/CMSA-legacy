import { useCallback, useState } from 'react'
import type { ValidationFilter } from '../../../utils/validationViewHelpers'

const SKELETON_MS = 300

export function useValidationView() {
  const [filter, setFilter] = useState<ValidationFilter>('all')
  const [isLoading, setIsLoading] = useState(false)

  const withSkeleton = useCallback((apply: () => void) => {
    setIsLoading(true)
    apply()
    window.setTimeout(() => setIsLoading(false), SKELETON_MS)
  }, [])

  const changeFilter = useCallback(
    (next: ValidationFilter) => {
      withSkeleton(() => setFilter(next))
    },
    [withSkeleton],
  )

  const triggerSkeleton = useCallback(
    (apply: () => void) => {
      withSkeleton(apply)
    },
    [withSkeleton],
  )

  return { filter, isLoading, changeFilter, triggerSkeleton }
}
