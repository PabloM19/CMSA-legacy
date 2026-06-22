import { mockCredentials } from '../data/mockUsers'
import type { AuthSession, User } from '../types/auth'

const AUTH_STORAGE_KEY = 'cmsa-auth'

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function setSession(user: User): void {
  const session: AuthSession = {
    user,
    loggedInAt: new Date().toISOString(),
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function authenticate(username: string, password: string): User | null {
  const match = mockCredentials.find(
    (cred) => cred.username === username && cred.password === password,
  )
  return match?.user ?? null
}

export function getPostLoginPath(user: User): string {
  if (user.role === 'validator') return '/validation'
  return '/dashboard'
}
