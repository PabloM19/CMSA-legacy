import type { StatusBadgeVariant } from '../../utils/statusBadge'

interface StatusBadgeProps {
  label: string
  variant?: StatusBadgeVariant
  className?: string
}

interface CompanyBadgeProps {
  company: string
  className?: string
}

export function StatusBadge({ label, variant = 'neutral', className = '' }: StatusBadgeProps) {
  return (
    <span className={`ui-status-badge ui-status-badge--${variant} ${className}`.trim()}>
      {label}
    </span>
  )
}

export function CompanyBadge({ company, className = '' }: CompanyBadgeProps) {
  const key = company.toLowerCase()
  const variant =
    key === 'sumo' || key === 'maf' || key === 'master' || key === 'cmsa' ? key : 'cmsa'
  return (
    <span className={`ui-badge ui-badge--${variant} dash-chip dash-chip--${variant} ${className}`.trim()}>
      {company}
    </span>
  )
}
