const SIDEBAR_COLLAPSED_PREFIX = 'cmsa-sidebar-collapsed-'
const GUEST_SIDEBAR_KEY = `${SIDEBAR_COLLAPSED_PREFIX}guest`

export function readGuestSidebarCollapsed(): boolean {
  const stored = localStorage.getItem(GUEST_SIDEBAR_KEY)
  if (stored === null) return true
  return stored === 'true'
}

export function saveGuestSidebarCollapsed(collapsed: boolean): void {
  localStorage.setItem(GUEST_SIDEBAR_KEY, String(collapsed))
}

export function getSidebarCollapsedKey(username: string): string {
  return `${SIDEBAR_COLLAPSED_PREFIX}${username}`
}

export function readSidebarCollapsed(username: string): boolean {
  return localStorage.getItem(getSidebarCollapsedKey(username)) === 'true'
}

export function saveSidebarCollapsed(username: string, collapsed: boolean): void {
  localStorage.setItem(getSidebarCollapsedKey(username), String(collapsed))
}
