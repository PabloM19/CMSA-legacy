import type { HTMLAttributes, ReactNode } from 'react'

export type CardVariant = 'default' | 'interactive' | 'kpi' | 'warning' | 'compact' | 'company'

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant
  company?: 'SUMO' | 'MAF' | null
  as?: 'article' | 'section' | 'div'
  children: ReactNode
}

const VARIANT_CLASS: Record<CardVariant, string> = {
  default: '',
  interactive: 'ui-card--interactive',
  kpi: 'ui-card--kpi',
  warning: 'ui-card--warning',
  compact: 'ui-card--compact',
  company: '',
}

export function Card({
  variant = 'default',
  company,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}: CardProps) {
  const classes = [
    'ui-card',
    'dash-card',
    VARIANT_CLASS[variant],
    company === 'SUMO' ? 'ui-card--company-sumo order-card--sumo' : '',
    company === 'MAF' ? 'ui-card--company-maf order-card--maf' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  )
}
