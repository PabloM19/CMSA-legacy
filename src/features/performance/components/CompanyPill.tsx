interface CompanyPillProps {
  company: 'SUMO' | 'MAF' | null
  emptyLabel?: string
}

export function CompanyPill({ company, emptyLabel = '—' }: CompanyPillProps) {
  if (!company) {
    return <span className="performance-company-empty">{emptyLabel}</span>
  }

  return (
    <span className={`admin-badge admin-badge--${company.toLowerCase()}`}>{company}</span>
  )
}
