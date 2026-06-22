import type { Company } from '../types/auth'

export function getCompanyThemeClass(company: Company): string {
  const map: Record<Company, string> = {
    SUMO: 'theme-sumo',
    MAF: 'theme-maf',
    MASTER: 'theme-master',
    CMSA: 'theme-brand',
  }
  return map[company]
}

export function formatHeaderDate(date: Date, locale = 'es-ES'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
