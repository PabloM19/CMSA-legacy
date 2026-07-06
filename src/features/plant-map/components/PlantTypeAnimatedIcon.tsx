import { useEffect, useRef, type RefObject } from 'react'
import {
  BotMessageSquareIcon,
  BoxIcon,
  UserIcon,
  type BotMessageSquareIconHandle,
  type BoxIconHandle,
  type UserIconHandle,
} from 'lucide-animated'
import type { PlantElementView } from '../../../types/plant'

const TYPE_ICON_SIZE = 15
const LUCIDE_PULSE_MS = 1600

type LucideHandle = {
  startAnimation: () => void
  stopAnimation: () => void
}

function useLucidePulse(ref: RefObject<LucideHandle | null>) {
  useEffect(() => {
    let mounted = true
    let pulseTimer: ReturnType<typeof setTimeout> | undefined

    const pulse = () => {
      ref.current?.startAnimation()
      if (!mounted) return
      pulseTimer = setTimeout(pulse, LUCIDE_PULSE_MS)
    }

    const bootTimer = setTimeout(pulse, 50)

    return () => {
      mounted = false
      clearTimeout(bootTimer)
      if (pulseTimer) clearTimeout(pulseTimer)
    }
  }, [ref])
}

function AnimatedRobotIcon() {
  const ref = useRef<BotMessageSquareIconHandle>(null)
  useLucidePulse(ref)

  return (
    <BotMessageSquareIcon
      ref={ref}
      size={TYPE_ICON_SIZE}
      animateOnHover={false}
      aria-hidden
      className="plant-type-icon__lucide"
    />
  )
}

function AnimatedPalletizerIcon() {
  const ref = useRef<BoxIconHandle>(null)
  useLucidePulse(ref)

  return (
    <BoxIcon
      ref={ref}
      size={TYPE_ICON_SIZE}
      animateOnHover={false}
      aria-hidden
      className="plant-type-icon__lucide"
    />
  )
}

function AnimatedManualIcon() {
  const ref = useRef<UserIconHandle>(null)
  useLucidePulse(ref)

  return (
    <UserIcon
      ref={ref}
      size={TYPE_ICON_SIZE}
      animateOnHover={false}
      aria-hidden
      className="plant-type-icon__lucide"
    />
  )
}

interface PlantTypeAnimatedIconProps {
  type: PlantElementView['type']
}

export function PlantTypeAnimatedIcon({ type }: PlantTypeAnimatedIconProps) {
  return (
    <span className={`plant-type-icon__motion plant-type-icon__motion--${type}`} aria-hidden="true">
      {type === 'automatic' && <AnimatedRobotIcon />}
      {type === 'palletizer' && <AnimatedPalletizerIcon />}
      {type === 'manual' && <AnimatedManualIcon />}
    </span>
  )
}
