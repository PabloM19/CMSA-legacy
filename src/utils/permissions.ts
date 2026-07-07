import type { AdminTabId } from '../types/admin'
import type { NavKey } from '../i18n/translations'
import type { User, UserRole } from '../types/auth'

const OPERATOR_ROUTES = [
  '/orders/new',
  '/daily-orders',
  '/production-orders',
  '/backlog',
  '/plant-map',
  '/alarms',
  '/tablet',
  '/mobile',
  '/profile',
] as const

const SUPERVISOR_EXTRA_ROUTES = ['/admin', '/references', '/performance'] as const

export function normalizePath(path: string): string {
  return path.split('?')[0].replace(/\/$/, '') || '/'
}

export function isSuperAdmin(user: User): boolean {
  return user.role === 'superadmin'
}

/** Alias visible — mismo rol que superadmin. */
export function isSuperMaster(user: User): boolean {
  return isSuperAdmin(user)
}

export function isSupervisor(user: User): boolean {
  return user.role === 'supervisor' || user.role === 'superadmin'
}

export function isOperator(user: User): boolean {
  return user.role === 'user'
}

export function canAccessAdmin(user: User): boolean {
  return isSupervisor(user)
}

export function canAccessPerformance(_user?: User | null): boolean {
  return true
}

export function canViewGlobalActivityLog(user: User): boolean {
  return isSuperAdmin(user)
}

export function getAdminTabsForUser(user: User): AdminTabId[] {
  if (isSuperAdmin(user)) {
    return ['users', 'companies', 'references', 'tables', 'palletizers', 'alarms', 'activity']
  }
  if (user.role === 'supervisor') {
    return ['users', 'references', 'alarms', 'production']
  }
  return []
}

export function canAccessRoute(user: User, path: string): boolean {
  const normalized = normalizePath(path)

  if (normalized === '/profile') return true

  if (normalized === '/plant-map') return true

  if (normalized === '/dashboard' || normalized === '/validation') {
    return true
  }

  if (normalized === '/backlog') {
    return canAccessRoute(user, '/daily-orders')
  }

  if (normalized === '/performance') {
    return true
  }

  if (isSuperAdmin(user)) return true

  if (normalized === '/admin') {
    return isSupervisor(user)
  }

  if (normalized === '/alarms') {
    return true
  }

  if (normalized === '/references') {
    return isSupervisor(user)
  }

  if (user.role === 'supervisor') {
    return [...OPERATOR_ROUTES, ...SUPERVISOR_EXTRA_ROUTES].includes(
      normalized as (typeof OPERATOR_ROUTES)[number] | (typeof SUPERVISOR_EXTRA_ROUTES)[number],
    )
  }

  if (user.role === 'user') {
    return (OPERATOR_ROUTES as readonly string[]).includes(normalized)
  }

  return false
}

export function getDefaultRoute(user: User): string {
  if (user.role === 'supervisor') return '/performance'
  return '/plant-map'
}

export const GUEST_NAV_ITEMS: { to: string; key: NavKey }[] = [
  { to: '/plant-map', key: 'plantMap' },
  { to: '/performance', key: 'performance' },
]

export function getGuestNavItems() {
  return GUEST_NAV_ITEMS
}

export const NAV_ITEMS: { to: string; key: NavKey }[] = [
  { to: '/plant-map', key: 'plantMap' },
  { to: '/performance', key: 'performance' },
  { to: '/daily-orders', key: 'dailyOrders' },
  { to: '/production-orders', key: 'productionOrders' },
  { to: '/references', key: 'references' },
  { to: '/alarms', key: 'alarms' },
  { to: '/admin', key: 'admin' },
  { to: '/profile', key: 'profile' },
]

export function canManageUsers(user: User): boolean {
  return isSupervisor(user)
}

export function canManageCompanies(user: User): boolean {
  return isSuperAdmin(user)
}

export function canManagePlantElements(user: User): boolean {
  return isSuperAdmin(user)
}

/** Roles que el actor puede asignar al crear/editar usuarios mock. */
export function getAssignableRoles(actor: User): UserRole[] {
  if (isSuperAdmin(actor)) return ['user', 'supervisor', 'superadmin']
  if (actor.role === 'supervisor') return ['user', 'supervisor']
  return []
}

export function canEditAdminUser(actor: User, targetRole: UserRole): boolean {
  if (isSuperAdmin(actor)) return true
  if (actor.role === 'supervisor') return targetRole !== 'superadmin'
  return false
}

export function canAssignAdminRole(actor: User, role: UserRole): boolean {
  return getAssignableRoles(actor).includes(role)
}

export function canWithdrawProduction(user: User): boolean {
  return isSupervisor(user)
}

export function getMobileNavItems(user: User) {
  let items = getVisibleNavItems(user).filter(
    (item) => item.key !== 'tablet' && item.key !== 'mobile',
  )

  if (!items.some((item) => item.key === 'profile')) {
    items.push({ to: '/profile', key: 'profile' })
  }

  return items
}

export function getVisibleNavItems(user: User) {
  return NAV_ITEMS.filter((item) => {
    if (item.key === 'profile') return false
    if (item.key === 'performance') return true
    if (item.key === 'admin' || item.key === 'references') {
      return isSupervisor(user)
    }
    if (
      item.key === 'dailyOrders' ||
      item.key === 'productionOrders' ||
      item.key === 'alarms'
    ) {
      return canAccessRoute(user, item.to)
    }
    return canAccessRoute(user, item.to)
  })
}

export function canPerformValidation(_user: User): boolean {
  return false
}

export function canPerformTabletCriticalActions(user: User): boolean {
  return isSuperAdmin(user)
}

export function canMarkTabletIncident(user: User): boolean {
  return isSupervisor(user)
}
