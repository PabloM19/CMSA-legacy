import { mockCredentials } from '../data/mockUsers'
import type { AuthSession, User } from '../types/auth'
import {
  adminUserToAuthUser,
  getAdminUserByUsername,
  getUserPassword,
  saveUserPassword,
} from './adminStorage'
import { SESSION_DURATION_MS } from './sessionGuard'
import { getDefaultRoute } from './permissions'

const AUTH_STORAGE_KEY = 'cmsa-auth'

export type LoginResult =
  | { type: 'success'; user: User }
  | { type: 'password_setup_required'; user: User }
  | { type: 'invalid' }

export type PasswordSetupResult =
  | { ok: true; user: User }
  | { ok: false; error: 'missing_fields' | 'mismatch' | 'not_found' | 'inactive' }

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

function resolveSessionExpiry(session: AuthSession): number {
  if (session.sessionExpiresAt) {
    return new Date(session.sessionExpiresAt).getTime()
  }
  const loggedInAt = new Date(session.loggedInAt).getTime()
  return loggedInAt + SESSION_DURATION_MS
}

/** Devuelve la sesión solo si no ha superado las 24 h; si expiró, la elimina. */
export function getValidSession(): AuthSession | null {
  const session = getSession()
  if (!session) return null

  if (Date.now() >= resolveSessionExpiry(session)) {
    clearSession()
    return null
  }

  if (!session.sessionExpiresAt) {
    const migrated: AuthSession = {
      ...session,
      sessionExpiresAt: new Date(resolveSessionExpiry(session)).toISOString(),
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(migrated))
    return migrated
  }

  return session
}

export function setSession(user: User): void {
  const now = Date.now()
  const session: AuthSession = {
    user,
    loggedInAt: new Date(now).toISOString(),
    sessionExpiresAt: new Date(now + SESSION_DURATION_MS).toISOString(),
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

function verifyPassword(username: string, password: string): boolean {
  const stored = getUserPassword(username)
  return stored != null && stored === password
}

/** @deprecated Usar resolveLogin */
export function authenticate(username: string, password: string): User | null {
  const result = resolveLogin(username, password)
  return result.type === 'success' ? result.user : null
}

export function resolveLogin(username: string, password: string): LoginResult {
  const trimmed = username.trim()
  if (!trimmed) return { type: 'invalid' }

  const adminUser = getAdminUserByUsername(trimmed)
  if (adminUser) {
    if (adminUser.status !== 'activo') return { type: 'invalid' }
    const user = adminUserToAuthUser(adminUser)
    if (adminUser.requiresPasswordSetup) {
      return { type: 'password_setup_required', user }
    }
    if (verifyPassword(trimmed, password)) {
      return { type: 'success', user }
    }
    return { type: 'invalid' }
  }

  const cred = mockCredentials.find((c) => c.username === trimmed)
  if (cred && cred.password === password) {
    return { type: 'success', user: cred.user }
  }

  return { type: 'invalid' }
}

export function completePasswordSetup(
  username: string,
  password: string,
  confirmPassword: string,
): PasswordSetupResult {
  const trimmed = username.trim()
  const adminUser = getAdminUserByUsername(trimmed)
  if (!adminUser) return { ok: false, error: 'not_found' }
  if (adminUser.status !== 'activo') return { ok: false, error: 'inactive' }
  if (!password.trim() || !confirmPassword.trim()) {
    return { ok: false, error: 'missing_fields' }
  }
  if (password !== confirmPassword) {
    return { ok: false, error: 'mismatch' }
  }

  const updated = saveUserPassword(trimmed, password)
  if (!updated) return { ok: false, error: 'not_found' }

  return { ok: true, user: adminUserToAuthUser(updated) }
}

export function getPostLoginPath(user: User): string {
  return getDefaultRoute(user)
}
