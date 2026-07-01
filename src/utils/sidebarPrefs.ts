const SIDEBAR_COLLAPSED_PREFIX = 'cmsa-sidebar-collapsed-'

export function getSidebarCollapsedKey(username: string): string {
  return `${SIDEBAR_COLLAPSED_PREFIX}${username}`
}

export function readSidebarCollapsed(username: string): boolean {
  return localStorage.getItem(getSidebarCollapsedKey(username)) === 'true'
}

export function saveSidebarCollapsed(username: string, collapsed: boolean): void {
  localStorage.setItem(getSidebarCollapsedKey(username), String(collapsed))
}
