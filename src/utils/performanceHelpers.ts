import type { Lang } from '../i18n/translations'

/** Eficiencia = cajas/h actuales respecto a capacidad máxima estimada de la estación. */
export function computeStationEfficiency(boxesPerHour: number, maxCapacityPerHour: number): number {
  if (maxCapacityPerHour <= 0) return 0
  return Math.min(100, Math.round((boxesPerHour / maxCapacityPerHour) * 100))
}

export function formatStationCapacity(
  boxesPerHour: number,
  maxCapacityPerHour: number,
  lang: Lang,
): string {
  const locale = lang === 'es' ? 'es-ES' : 'en-GB'
  const fmt = (n: number) => n.toLocaleString(locale)
  const unit = lang === 'es' ? 'cajas/h' : 'boxes/h'
  return `${fmt(boxesPerHour)} / ${fmt(maxCapacityPerHour)} ${unit}`
}
