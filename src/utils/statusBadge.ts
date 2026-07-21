import type { Lang } from '../i18n/translations'
import type { BacklogColumnId, BacklogOrder, PreparationStatus, ProductionVisualState } from '../types/backlog'
import type { PlantPalletizerStatus, PlantTableStatus } from '../types/plant'

export type StatusBadgeVariant =
  | 'free'
  | 'queue'
  | 'pending'
  | 'pending_validation'
  | 'preparing'
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
  en_backlog: { label: 'Por ordenar', variant: 'queue' },
  en_preparacion: { label: 'En preparación', variant: 'preparing' },
  en_produccion: { label: 'En producción', variant: 'executing' },
  finalizado: { label: 'Acabado', variant: 'finished' },
}

const COLUMN_LABELS_EN: Record<BacklogColumnId, { label: string; variant: StatusBadgeVariant }> = {
  en_backlog: { label: 'To sort', variant: 'queue' },
  en_preparacion: { label: 'In preparation', variant: 'preparing' },
  en_produccion: { label: 'In production', variant: 'executing' },
  finalizado: { label: 'Completed', variant: 'finished' },
}

const PREP_ES: Record<PreparationStatus, StatusBadgeInfo> = {
  pending_preparation: { label: 'Pendiente de preparación', variant: 'preparing' },
  waiting_cell: { label: 'Esperando confirmación de celda', variant: 'info' },
  preparing_recipe: { label: 'Preparando receta', variant: 'preparing' },
}

const PREP_EN: Record<PreparationStatus, StatusBadgeInfo> = {
  pending_preparation: { label: 'Pending preparation', variant: 'preparing' },
  waiting_cell: { label: 'Waiting for cell confirmation', variant: 'info' },
  preparing_recipe: { label: 'Preparing recipe', variant: 'preparing' },
}

const PROD_ES: Record<ProductionVisualState, StatusBadgeInfo> = {
  producing: { label: 'En producción', variant: 'executing' },
  temp_waiting: { label: 'En espera temporal', variant: 'warning' },
  temp_blocked: { label: 'Bloqueo temporal', variant: 'blocked' },
  element_blocked: { label: 'Elemento bloqueado', variant: 'critical' },
  completed: { label: 'Acabado', variant: 'finished' },
  withdrawn: { label: 'Retirado', variant: 'neutral' },
}

const PROD_EN: Record<ProductionVisualState, StatusBadgeInfo> = {
  producing: { label: 'In production', variant: 'executing' },
  temp_waiting: { label: 'Temporary hold', variant: 'warning' },
  temp_blocked: { label: 'Temporary block', variant: 'blocked' },
  element_blocked: { label: 'Element blocked', variant: 'critical' },
  completed: { label: 'Completed', variant: 'finished' },
  withdrawn: { label: 'Withdrawn', variant: 'neutral' },
}

export function getOrderStatusBadge(order: BacklogOrder, lang: Lang): StatusBadgeInfo {
  if (order.productionState === 'withdrawn') {
    return lang === 'es' ? PROD_ES.withdrawn : PROD_EN.withdrawn
  }
  if (order.column === 'finalizado' || order.productionState === 'completed') {
    return lang === 'es' ? PROD_ES.completed : PROD_EN.completed
  }
  if (
    order.column === 'en_preparacion' &&
    order.preparationStatus === 'pending_preparation'
  ) {
    return lang === 'es'
      ? { label: 'Pendiente de aceptación', variant: 'pending' }
      : { label: 'Pending acceptance', variant: 'pending' }
  }
  if (order.column === 'en_produccion' && order.productionState) {
    const dict = lang === 'es' ? PROD_ES : PROD_EN
    return dict[order.productionState]
  }
  if (order.column === 'en_preparacion' && order.preparationStatus) {
    const dict = lang === 'es' ? PREP_ES : PREP_EN
    return dict[order.preparationStatus]
  }
  return getColumnStatusBadge(order.column, lang)
}

export function getColumnStatusBadge(column: BacklogColumnId, lang: Lang): StatusBadgeInfo {
  const dict = lang === 'es' ? COLUMN_LABELS_ES : COLUMN_LABELS_EN
  return dict[column] ?? { label: column, variant: 'neutral' }
}

const PLANT_STATUS_ES: Record<string, { label: string; variant: StatusBadgeVariant }> = {
  free: { label: 'Libre', variant: 'free' },
  validated: { label: 'Validado', variant: 'validated' },
  occupied: { label: 'En producción', variant: 'executing' },
  waiting: { label: 'En espera temporal', variant: 'waiting' },
  blocked: { label: 'Bloqueo temporal', variant: 'blocked' },
  conflict: { label: 'Elemento bloqueado', variant: 'conflict' },
  active: { label: 'Activo', variant: 'active' },
  idle: { label: 'Inactivo', variant: 'inactive' },
}

const PLANT_STATUS_EN: Record<string, { label: string; variant: StatusBadgeVariant }> = {
  free: { label: 'Free', variant: 'free' },
  validated: { label: 'Validated', variant: 'validated' },
  occupied: { label: 'In production', variant: 'executing' },
  waiting: { label: 'Temporary hold', variant: 'waiting' },
  blocked: { label: 'Temporary block', variant: 'blocked' },
  conflict: { label: 'Element blocked', variant: 'conflict' },
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
  active: { label: 'En producción', variant: 'executing' },
  finishing: { label: 'Próximo a finalizar', variant: 'finishing' },
  validation: { label: 'En preparación', variant: 'preparing' },
  delayed: { label: 'Retrasado', variant: 'danger' },
}

const DASH_ORDER_EN: Record<string, { label: string; variant: StatusBadgeVariant }> = {
  pending: { label: 'Pending', variant: 'pending' },
  active: { label: 'In production', variant: 'executing' },
  finishing: { label: 'About to finish', variant: 'finishing' },
  validation: { label: 'In preparation', variant: 'preparing' },
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
