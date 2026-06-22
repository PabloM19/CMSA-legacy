import type { Company, UserRole } from '../types/auth'

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Usuario',
  master: 'Master',
  validator: 'Validador',
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role]
}

export function getCompanyThemeClass(company: Company): string {
  const map: Record<Company, string> = {
    SUMO: 'theme-sumo',
    MAF: 'theme-maf',
    MASTER: 'theme-master',
    CMSA: 'theme-cmsa',
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
