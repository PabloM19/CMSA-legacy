import { Bot, Package, UserRound } from 'lucide-react'
import type { StationPerformanceRow } from '../../../data/mockPerformance'

type StationType = StationPerformanceRow['type']

interface StationTypeIconProps {
  type: StationType
  label: string
  size?: number
  className?: string
}

export function StationTypeIcon({ type, label, size = 20, className = '' }: StationTypeIconProps) {
  const Icon = type === 'robot' ? Bot : type === 'palletizer' ? Package : UserRound
  const toneClass =
    type === 'robot'
      ? 'station-type-icon--robot'
      : type === 'palletizer'
        ? 'station-type-icon--palletizer'
        : 'station-type-icon--manual'

  return (
    <span
      className={`station-type-icon ${toneClass} ${className}`.trim()}
      title={label}
      aria-label={label}
    >
      <Icon size={size} strokeWidth={2} aria-hidden="true" />
    </span>
  )
}