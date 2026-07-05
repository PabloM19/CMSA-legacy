import type { Lang } from '../../../i18n/translations'
import type { CellAlarm } from '../../../types/cellAlarm'

export type AlarmFilter = 'all' | 'active' | 'reviewed'

export function alarmStatusLabel(status: CellAlarm['status'], lang: Lang): string {
  const es = { active: 'Activa', reviewed: 'Revisada', resolved: 'Resuelta' }
  const en = { active: 'Active', reviewed: 'Reviewed', resolved: 'Resolved' }
  return (lang === 'es' ? es : en)[status]
}

export function alarmSeverityLabel(
  severity: CellAlarm['severity'],
  lang: Lang,
  labels: { high: string; medium: string },
): string {
  if (severity === 'critical') return labels.high
  if (severity === 'warning') return labels.medium
  return lang === 'es' ? 'Informativa' : 'Info'
}

export function matchesAlarmQuery(
  alarm: CellAlarm,
  query: string,
  lang: Lang,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    alarm.orderReference,
    alarm.cellCode,
    alarm.company,
    alarm.type,
    alarm.summary,
    alarm.message,
    alarmStatusLabel(alarm.status, lang),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export function filterAlarmsByStatus(alarms: CellAlarm[], filter: AlarmFilter): CellAlarm[] {
  if (filter === 'active') return alarms.filter((a) => a.status === 'active')
  if (filter === 'reviewed') return alarms.filter((a) => a.status === 'reviewed')
  return alarms
}
