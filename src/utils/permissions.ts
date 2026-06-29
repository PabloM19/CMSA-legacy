import type { NavKey } from '../i18n/translations'
import type { User } from '../types/auth'

const USER_ROUTES = [
  '/dashboard',
  '/orders/new',
  '/backlog',
  '/validation',
  '/plant-map',
  '/tablet',
  '/mobile',
] as const

const VALIDATOR_ROUTES = ['/validation', '/plant-map', '/tablet', '/mobile'] as const

export function normalizePath(path: string): string {
  return path.split('?')[0].replace(/\/$/, '') || '/'
}

export function canAccessRoute(user: User, path: string): boolean {
  const normalized = normalizePath(path)

  if (user.role === 'master') return true

  if (normalized === '/admin') return true

  if (normalized === '/mobile') return true

  if (user.role === 'validator') {
    return (VALIDATOR_ROUTES as readonly string[]).includes(normalized)
  }

  if (user.role === 'user') {
    return (USER_ROUTES as readonly string[]).includes(normalized)
  }

  return false
}

export function getDefaultRoute(user: User): string {
  if (user.role === 'validator') return '/validation'
  return '/dashboard'
}

export const NAV_ITEMS: { to: string; key: NavKey }[] = [
  { to: '/dashboard', key: 'dashboard' },
  { to: '/orders/new', key: 'newOrder' },
  { to: '/backlog', key: 'backlog' },
  { to: '/validation', key: 'validation' },
  { to: '/plant-map', key: 'plantMap' },
  { to: '/tablet', key: 'tablet' },
  { to: '/mobile', key: 'mobile' },
  { to: '/admin', key: 'admin' },
]

/** Navegación móvil mínima: consulta primero, sin acciones operativas. */
export function getMobileNavItems(user: User) {
  const items: { to: string; key: NavKey }[] = [
    { to: '/mobile', key: 'mobile' },
    { to: '/plant-map', key: 'plantMap' },
  ]

  if (user.role === 'master' && canAccessRoute(user, '/dashboard')) {
    items.push({ to: '/dashboard', key: 'dashboard' })
  }

  return items
}

export function getVisibleNavItems(user: User) {
  return NAV_ITEMS.filter((item) => {
    if (['mobile', 'tablet'].includes(item.key)) return false
    if (item.key === 'admin') return user.role === 'master'
    return canAccessRoute(user, item.to)
  })
}

export function canPerformValidation(user: User): boolean {
  return user.role === 'validator' || user.role === 'master'
}

/** Parada / reanudación simulada en tablet */
export function canPerformTabletCriticalActions(user: User): boolean {
  return user.role === 'master'
}

/** Marcar incidencia desde tablet */
export function canMarkTabletIncident(user: User): boolean {
  return user.role === 'master' || user.role === 'validator'
}
