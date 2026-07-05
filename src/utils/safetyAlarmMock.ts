const STORAGE_KEY = 'cmsa-safety-alarm-active'
const ACTIVATED_AT_KEY = 'cmsa-safety-alarm-at'

export function isSafetyAlarmActive(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function getSafetyAlarmActivatedAt(): number | null {
  try {
    const raw = localStorage.getItem(ACTIVATED_AT_KEY)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

export function activateSafetyAlarmMock(): void {
  localStorage.setItem(STORAGE_KEY, '1')
  localStorage.setItem(ACTIVATED_AT_KEY, String(Date.now()))
}

export function resolveSafetyAlarmMock(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(ACTIVATED_AT_KEY)
}
