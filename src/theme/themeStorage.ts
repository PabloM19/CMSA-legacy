import { patchUserPreferences, readUserPreferences } from '../utils/userPreferences'

export type Theme = 'light' | 'dark'

export function readStoredTheme(username: string): Theme {
  return readUserPreferences(username).theme
}

export function saveStoredTheme(username: string, theme: Theme): void {
  patchUserPreferences(username, { theme })
}

export function applyThemeToDocument(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}
