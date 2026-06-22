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

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/orders/new', label: 'Nueva orden' },
  { to: '/backlog', label: 'Backlog' },
  { to: '/validation', label: 'Validación' },
  { to: '/plant-map', label: 'Mapa de planta' },
  { to: '/tablet', label: 'Tablet' },
  { to: '/mobile', label: 'Mobile' },
  { to: '/admin', label: 'Admin' },
] as const

export function getVisibleNavItems(user: User) {
  return NAV_ITEMS.filter((item) => canAccessRoute(user, item.to))
}
