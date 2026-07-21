import { mockCredentials } from '../data/mockUsers'
import { getAdminUserByUsername } from './adminStorage'
import {
  isUserLoginLocked,
  recordFailedPasswordAttempt,
  resetLoginAttempts,
  type RecordFailedAttemptResult,
} from './loginAttemptsStorage'
import { resolveLogin, type LoginResult } from './auth'

export type LoginAttemptError =
  | 'user_not_found'
  | 'wrong_password'
  | 'locked'
  | 'empty_username'

export type AttemptLoginResult =
  | { type: 'success'; login: Extract<LoginResult, { type: 'success' }> }
  | { type: 'password_setup_required'; login: Extract<LoginResult, { type: 'password_setup_required' }> }
  | { type: 'failure'; error: LoginAttemptError; attempts?: RecordFailedAttemptResult }

export function mockUserExists(username: string): boolean {
  const trimmed = username.trim()
  if (!trimmed) return false

  const adminUser = getAdminUserByUsername(trimmed)
  if (adminUser) return adminUser.status === 'activo'

  return mockCredentials.some((cred) => cred.username === trimmed)
}

export function attemptLogin(username: string, password: string): AttemptLoginResult {
  const trimmed = username.trim()
  if (!trimmed) {
    return { type: 'failure', error: 'empty_username' }
  }

  if (isUserLoginLocked(trimmed)) {
    return { type: 'failure', error: 'locked' }
  }

  if (!mockUserExists(trimmed)) {
    return { type: 'failure', error: 'user_not_found' }
  }

  const login = resolveLogin(trimmed, password)

  if (login.type === 'success') {
    resetLoginAttempts(trimmed)
    return { type: 'success', login }
  }

  if (login.type === 'password_setup_required') {
    resetLoginAttempts(trimmed)
    return { type: 'password_setup_required', login }
  }

  const attempts = recordFailedPasswordAttempt(trimmed)
  if (attempts.locked) {
    return { type: 'failure', error: 'locked', attempts }
  }

  return { type: 'failure', error: 'wrong_password', attempts }
}
