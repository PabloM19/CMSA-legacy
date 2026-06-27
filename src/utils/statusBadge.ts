import type { Lang } from '../i18n/translations'
import type { BacklogColumnId } from '../types/backlog'
import type { PlantPalletizerStatus, PlantTableStatus } from '../types/plant'

export type StatusBadgeVariant =
  | 'free'
  | 'queue'
  | 'pending'
  | 'pending_validation'
  | 'validated'
  | 'executing'
  | 'waiting'
  | 'finishing'
  | 'finished'
  | 'blocked'
  | 'incident'
  | 'conflict'
  | 'active'
  | 'inactive'
  | 'occupied'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'ok'
  | 'critical'

export interface StatusBadgeInfo {
  label: string
  variant: StatusBadgeVariant
}

const COLUMN_LABELS_ES: Record<BacklogColumnId, { label: string; variant: StatusBadgeVariant }> = {
  en_backlog: { label: 'En cola', variant: 'queue' },
  pendiente_lanzamiento: { label: 'Pendiente', variant: 'pending' },
  pendiente_validacion: { label: 'Pendiente de validación', variant: 'pending_validation' },
  en_ejecucion: { label: 'En ejecución', variant: 'executing' },
  bloqueado: { label: 'Bloqueado', variant: 'blocked' },
  finalizado: { label: 'Finalizado', variant: 'finished' },
}

const COLUMN_LABELS_EN: Record<BacklogColumnId, { label: string; variant: StatusBadgeVariant }> = {
  en_backlog: { label: 'In queue', variant: 'queue' },
  pendiente_lanzamiento: { label: 'Pending', variant: 'pending' },
  pendiente_validacion: { label: 'Pending validation', variant: 'pending_validation' },
  en_ejecucion: { label: 'In execution', variant: 'executing' },
  bloqueado: { label: 'Blocked', variant: 'blocked' },
  finalizado: { label: 'Finished', variant: 'finished' },
}

export function getColumnStatusBadge(column: BacklogColumnId, lang: Lang): StatusBadgeInfo {
  const dict = lang === 'es' ? COLUMN_LABELS_ES : COLUMN_LABELS_EN
  return dict[column] ?? { label: column, variant: 'neutral' }
}

const PLANT_STATUS_ES: Record<string, { label: string; variant: StatusBadgeVariant }> = {
  free: { label: 'Libre', variant: 'free' },
  reserved: { label: 'Reservada', variant: 'pending' },
  pending_validation: { label: 'Pendiente de validación', variant: 'pending_validation' },
  validated: { label: 'Validado', variant: 'validated' },
  occupied: { label: 'En ejecución', variant: 'executing' },
  waiting: { label: 'En espera', variant: 'waiting' },
  blocked: { label: 'Bloqueado', variant: 'blocked' },
  conflict: { label: 'Conflicto', variant: 'conflict' },
  active: { label: 'Activo', variant: 'active' },
  idle: { label: 'Inactivo', variant: 'inactive' },
}

const PLANT_STATUS_EN: Record<string, { label: string; variant: StatusBadgeVariant }> = {
  free: { label: 'Free', variant: 'free' },
  reserved: { label: 'Reserved', variant: 'pending' },
  pending_validation: { label: 'Pending validation', variant: 'pending_validation' },
  validated: { label: 'Validated', variant: 'validated' },
  occupied: { label: 'In execution', variant: 'executing' },
  waiting: { label: 'Waiting', variant: 'waiting' },
  blocked: { label: 'Blocked', variant: 'blocked' },
  conflict: { label: 'Conflict', variant: 'conflict' },
  active: { label: 'Active', variant: 'active' },
  idle: { label: 'Inactive', variant: 'inactive' },
}

export function getPlantStatusBadge(
  status: PlantTableStatus | PlantPalletizerStatus,
  lang: Lang,
): StatusBadgeInfo {
  const dict = lang === 'es' ? PLANT_STATUS_ES : PLANT_STATUS_EN
  return dict[status] ?? { label: status, variant: 'neutral' }
}

const DASH_ORDER_ES: Record<string, { label: string; variant: StatusBadgeVariant }> = {
  pending: { label: 'Pendiente', variant: 'pending' },
  active: { label: 'En ejecución', variant: 'executing' },
  finishing: { label: 'Próximo a finalizar', variant: 'finishing' },
  validation: { label: 'Pendiente de validación', variant: 'pending_validation' },
  delayed: { label: 'Retrasado', variant: 'danger' },
}

const DASH_ORDER_EN: Record<string, { label: string; variant: StatusBadgeVariant }> = {
  pending: { label: 'Pending', variant: 'pending' },
  active: { label: 'In execution', variant: 'executing' },
  finishing: { label: 'About to finish', variant: 'finishing' },
  validation: { label: 'Pending validation', variant: 'pending_validation' },
  delayed: { label: 'Delayed', variant: 'danger' },
}

export function getDashboardOrderStatusBadge(status: string, lang: Lang): StatusBadgeInfo {
  const dict = lang === 'es' ? DASH_ORDER_ES : DASH_ORDER_EN
  return dict[status] ?? { label: status, variant: 'neutral' }
}

export function companyBadgeClass(company: string): string {
  const key = company.toLowerCase()
  if (key === 'sumo' || key === 'maf') return `ui-badge ui-badge--${key}`
  return `ui-badge ui-badge--${key === 'master' ? 'master' : 'cmsa'}`
}
