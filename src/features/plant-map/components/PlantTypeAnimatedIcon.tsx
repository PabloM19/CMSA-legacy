import { memo } from 'react'
import { Package, UserRound } from 'lucide-react'
import type { PlantElementView } from '../../../types/plant'
import { RobotArmIcon } from './RobotArmIcon'

const TYPE_ICON_SIZE = 15

interface PlantTypeAnimatedIconProps {
  type: PlantElementView['type']
}

function PlantTypeAnimatedIconInner({ type }: PlantTypeAnimatedIconProps) {
  if (type === 'automatic') {
    return (
      <span className="plant-type-icon__motion" aria-hidden="true">
        <RobotArmIcon size={TYPE_ICON_SIZE} strokeWidth={2} className="plant-type-icon__lucide" />
      </span>
    )
  }

  const Icon = type === 'palletizer' ? Package : UserRound

  return (
    <span className="plant-type-icon__motion" aria-hidden="true">
      <Icon size={TYPE_ICON_SIZE} strokeWidth={2} className="plant-type-icon__lucide" />
    </span>
  )
}

export const PlantTypeAnimatedIcon = memo(PlantTypeAnimatedIconInner)
