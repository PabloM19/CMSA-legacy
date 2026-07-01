import type { Lang } from '../i18n/translations'
import type { AdminCompany, AdminPalletizerRow, AdminTableRow, AdminUser } from '../types/admin'
import type { BacklogOrder } from '../types/backlog'
import { getStatusLabel } from './plantMapHelpers'

export function normalizeSearch(value: string): string {
  return value.trim().toLowerCase()
}

export function getAdminUserEmail(user: AdminUser): string {
  return `${user.username}@cmsa.mock`
}

export function filterAdminUsers(users: AdminUser[], query: string, lang: Lang): AdminUser[] {
  const q = normalizeSearch(query)
  if (!q) return users

  return users.filter((user) => {
    const email = getAdminUserEmail(user)
    const haystack = [
      user.name,
      user.username,
      email,
      user.role,
      user.company,
      user.status,
      lang === 'es' ? (user.status === 'activo' ? 'activo' : 'inactivo') : user.status,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export interface EnrichedAdminCompany extends AdminCompany {
  code: string
  associatedUsers: number
  activeOrders: number
}

export function enrichAdminCompanies(
  companies: AdminCompany[],
  users: AdminUser[],
  orders: BacklogOrder[],
): EnrichedAdminCompany[] {
  return companies.map((company) => ({
    ...company,
    code: company.name,
    associatedUsers: users.filter(
      (user) => user.company === company.name && user.status === 'activo',
    ).length,
    activeOrders: orders.filter(
      (order) => order.company === company.name && order.column === 'en_produccion',
    ).length,
  }))
}

export function filterAdminCompanies(companies: EnrichedAdminCompany[], query: string): EnrichedAdminCompany[] {
  const q = normalizeSearch(query)
  if (!q) return companies

  return companies.filter((company) => {
    const haystack = [
      company.name,
      company.code,
      company.color,
      company.status,
      String(company.associatedUsers),
      String(company.activeOrders),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export function filterAdminTables(
  tables: AdminTableRow[],
  query: string,
  lang: Lang,
): AdminTableRow[] {
  const q = normalizeSearch(query)
  if (!q) return tables

  return tables.filter((table) => {
    const typeLabel = table.type === 'automatic' ? 'automática automatic' : 'manual'
    const statusLabel = getStatusLabel(table.status, lang).toLowerCase()
    const haystack = [
      table.name,
      table.type,
      typeLabel,
      table.status,
      statusLabel,
      table.company ?? '',
      table.orderReference ?? '',
      table.active ? 'activa active' : 'inactiva inactive',
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export function filterAdminPalletizers(
  rows: AdminPalletizerRow[],
  query: string,
  lang: Lang,
): AdminPalletizerRow[] {
  const q = normalizeSearch(query)
  if (!q) return rows

  return rows.filter((row) => {
    const statusLabel = getStatusLabel(row.status, lang).toLowerCase()
    const haystack = [row.name, row.status, statusLabel, row.alert ?? '', row.active ? 'activo active' : 'inactivo inactive']
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}
