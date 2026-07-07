import { memo } from 'react'
import { Bot, Package, UserRound } from 'lucide-react'
import type { PlantElementView } from '../../../types/plant'

const TYPE_ICON_SIZE = 15

interface PlantTypeAnimatedIconProps {
  type: PlantElementView['type']
}

function PlantTypeAnimatedIconInner({ type }: PlantTypeAnimatedIconProps) {
  const Icon =
    type === 'automatic' ? Bot : type === 'palletizer' ? Package : UserRound

  return (
    <span className={`plant-type-icon__motion plant-type-icon__motion--${type}`} aria-hidden="true">
      <Icon size={TYPE_ICON_SIZE} strokeWidth={2} className="plant-type-icon__lucide" />
    </span>
  )
}

export const PlantTypeAnimatedIcon = memo(PlantTypeAnimatedIconInner)
