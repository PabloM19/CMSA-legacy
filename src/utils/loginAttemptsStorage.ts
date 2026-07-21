const LOGIN_ATTEMPTS_KEY = 'cmsa_login_attempts'
export const MAX_LOGIN_ATTEMPTS = 3

export interface LoginAttemptRecord {
  failedAttempts: number
  locked: boolean
  lastFailedAt: string
}

export type LoginAttemptsStore = Record<string, LoginAttemptRecord>

export interface RecordFailedAttemptResult {
  failedAttempts: number
  remainingAttempts: number
  locked: boolean
}

function readStore(): LoginAttemptsStore {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as LoginAttemptsStore
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store: LoginAttemptsStore): void {
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(store))
}

function normalizeUsername(username: string): string {
  return username.trim()
}

export function getLoginAttemptRecord(username: string): LoginAttemptRecord | null {
  const key = normalizeUsername(username)
  if (!key) return null
  return readStore()[key] ?? null
}

export function isUserLoginLocked(username: string): boolean {
  const record = getLoginAttemptRecord(username)
  return record?.locked === true
}

export function resetLoginAttempts(username: string): void {
  const key = normalizeUsername(username)
  if (!key) return

  const store = readStore()
  if (!store[key]) return

  delete store[key]
  writeStore(store)
}

export function recordFailedPasswordAttempt(username: string): RecordFailedAttemptResult {
  const key = normalizeUsername(username)
  const now = new Date().toISOString()
  const store = readStore()
  const current = store[key] ?? { failedAttempts: 0, locked: false, lastFailedAt: now }

  const failedAttempts = Math.min(MAX_LOGIN_ATTEMPTS, current.failedAttempts + 1)
  const locked = failedAttempts >= MAX_LOGIN_ATTEMPTS

  store[key] = {
    failedAttempts,
    locked,
    lastFailedAt: now,
  }
  writeStore(store)

  return {
    failedAttempts,
    remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - failedAttempts),
    locked,
  }
}

export { LOGIN_ATTEMPTS_KEY }
