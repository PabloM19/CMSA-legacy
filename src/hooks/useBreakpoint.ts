import { useEffect, useState } from 'react'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

const MOBILE_MQ = '(max-width: 767px)'
const TABLET_MQ = '(min-width: 768px) and (max-width: 1099px)'

function resolveBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia(MOBILE_MQ).matches) return 'mobile'
  if (window.matchMedia(TABLET_MQ).matches) return 'tablet'
  return 'desktop'
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(resolveBreakpoint)

  useEffect(() => {
    const update = () => setBreakpoint(resolveBreakpoint())
    update()

    const mobile = window.matchMedia(MOBILE_MQ)
    const tablet = window.matchMedia(TABLET_MQ)
    mobile.addEventListener('change', update)
    tablet.addEventListener('change', update)
    window.addEventListener('resize', update)

    return () => {
      mobile.removeEventListener('change', update)
      tablet.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return breakpoint
}
