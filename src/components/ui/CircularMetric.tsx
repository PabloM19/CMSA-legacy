import type { CSSProperties, ReactNode } from 'react'

interface CircularMetricProps {
  value: number
  max?: number
  display?: ReactNode
  label?: string
  hint?: string
  size?: 'md' | 'sm'
  tone?: 'brand' | 'sumo' | 'maf' | 'success' | 'warning'
  className?: string
}

const TONE_COLORS: Record<NonNullable<CircularMetricProps['tone']>, string> = {
  brand: 'var(--color-brand)',
  sumo: 'var(--color-sumo)',
  maf: 'var(--color-maf)',
  success: 'var(--color-success, #15803d)',
  warning: 'var(--color-warning, #b45309)',
}

export function CircularMetric({
  value,
  max = 100,
  display,
  label,
  hint,
  size = 'md',
  tone = 'brand',
  className = '',
}: CircularMetricProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const color = TONE_COLORS[tone]

  const style = {
    '--metric-value': pct,
    '--metric-color': color,
  } as CSSProperties

  return (
    <div className={`circular-metric circular-metric--${size} ${className}`.trim()}>
      <div className="circular-metric__ring" style={style} aria-hidden="true">
        <span className="circular-metric__value">{display ?? `${Math.round(pct)}%`}</span>
      </div>
      {label && <span className="circular-metric__label">{label}</span>}
      {hint && <span className="circular-metric__hint">{hint}</span>}
    </div>
  )
}
