import type { NavKey } from '../i18n/translations'
import type { User } from '../types/auth'

const USER_ROUTES = [
  '/dashboard',
  '/orders/new',
  '/backlog',
  '/plant-map',
  '/mobile',
] as const

const VALIDATOR_ROUTES = ['/validation', '/mobile'] as const

export function normalizePath(path: string): string {
  return path.split('?')[0].replace(/\/$/, '') || '/'
}

export function canAccessRoute(user: User, path: string): boolean {
  const normalized = normalizePath(path)

  if (user.role === 'master') return true

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

export function getVisibleNavItems(user: User) {
  return NAV_ITEMS.filter((item) => canAccessRoute(user, item.to))
}
