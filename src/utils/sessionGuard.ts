export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000
/** Tiempo sin actividad antes de mostrar aviso (mock). */
export const INACTIVITY_WARN_MS = 45 * 60 * 1000
/** Tiempo tras el aviso para cerrar sesión si no hay bloqueos. */
export const INACTIVITY_LOGOUT_MS = 5 * 60 * 1000
/** Ventana en la que se considera que el usuario sigue escribiendo. */
export const TYPING_GRACE_MS = 2 * 60 * 1000

let lastActivityAt = Date.now()
let lastInputAt = 0
let unsavedChangesCount = 0

export function touchSessionActivity(): void {
  lastActivityAt = Date.now()
}

export function touchSessionInput(): void {
  const now = Date.now()
  lastActivityAt = now
  lastInputAt = now
}

export function getLastActivityAt(): number {
  return lastActivityAt
}

export function registerSessionUnsaved(): () => void {
  unsavedChangesCount += 1
  return () => {
    unsavedChangesCount = Math.max(0, unsavedChangesCount - 1)
  }
}

export function isModalOpen(): boolean {
  if (typeof document === 'undefined') return false
  return Boolean(
    document.querySelector(
      '.order-modal-overlay, .ui-modal-overlay, [role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]',
    ),
  )
}

function isTypingRecently(): boolean {
  if (typeof document === 'undefined') return false
  const active = document.activeElement
  if (active) {
    const tag = active.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    if (active instanceof HTMLElement && active.isContentEditable) return true
  }
  return lastInputAt > 0 && Date.now() - lastInputAt < TYPING_GRACE_MS
}

export function hasSessionBlockers(options?: { includeModal?: boolean }): boolean {
  const includeModal = options?.includeModal ?? true
  return (
    (includeModal && isModalOpen()) ||
    isTypingRecently() ||
    unsavedChangesCount > 0
  )
}

export function resetSessionActivityClock(): void {
  lastActivityAt = Date.now()
  lastInputAt = 0
}
