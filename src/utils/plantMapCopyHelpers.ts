import type { Translations } from '../i18n/translations'
import type {
  PlantElementView,
  PlantPalletizerStatus,
  PlantSpeedStatus,
  PlantTableStatus,
} from '../types/plant'

type PlantMapCopy = Translations['plantMap']

export function getSpeedTooltip(speed: PlantSpeedStatus, d: PlantMapCopy): string | null {
  if (speed === 'slow') return d.iconSlowLong
  if (speed === 'fast') return d.iconFastLong
  if (speed === 'normal') return d.iconCheckLong
  return null
}

export function getSpeedShortLabel(speed: PlantSpeedStatus, d: PlantMapCopy): string | null {
  if (speed === 'slow') return d.iconSlowShort
  if (speed === 'fast') return d.iconFastShort
  if (speed === 'normal') return d.iconCheckShort
  return null
}

export function getDrawerSpeedMessage(speed: PlantSpeedStatus, d: PlantMapCopy): string | null {
  if (speed === 'slow') return d.drawerSlowDetail
  if (speed === 'fast') return d.drawerFastDetail
  if (speed === 'normal') return d.iconCheckLong
  return null
}

export function getDrawerStateNotice(
  element: PlantElementView,
  d: PlantMapCopy,
): { title: string; detail?: string; tone: 'info' | 'warn' | 'ok' } | null {
  if (element.status === 'waiting') {
    return { title: d.drawerWaitDetail, tone: 'info' }
  }
  if (element.status === 'blocked') {
    return { title: d.drawerBlockedDetail, tone: 'warn' }
  }
  if (element.status === 'conflict') {
    return { title: d.drawerConflictDetail, tone: 'warn' }
  }
  if (element.alert) {
    return {
      title: d.drawerWarningDetail,
      detail: element.alert,
      tone: 'warn',
    }
  }
  if (element.status === 'validated') {
    return { title: d.iconValidatedLong, tone: 'ok' }
  }
  return null
}

export function getCardStatusSoftLabel(
  status: PlantTableStatus | PlantPalletizerStatus,
  d: PlantMapCopy,
): string {
  const map: Partial<Record<string, string>> = {
    waiting: d.iconWaitShort,
    blocked: d.iconBlockedShort,
    conflict: d.iconWarningShort,
    validated: d.iconValidatedShort,
    pending_validation: d.legendPending,
    reserved: d.legendPending,
  }
  return map[status] ?? ''
}
