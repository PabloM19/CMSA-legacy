import type { PlantElementView } from '../types/plant'

export type PlantMapViewFilter = 'all' | 'free' | 'with_events' | 'in_production'

const PRODUCTION_STATUSES = new Set([
  'occupied',
  'active',
  'validated',
  'waiting',
  'blocked',
  'conflict',
])

export function isInProductionElement(element: PlantElementView): boolean {
  if (element.isDisabled) return false
  return PRODUCTION_STATUSES.has(element.status)
}

export function elementHasEvents(
  element: PlantElementView,
  eventCellCodes: Set<string>,
): boolean {
  if (element.isCritical) return true
  if (element.alert) return true
  if (element.status === 'blocked' || element.status === 'conflict') return true
  return eventCellCodes.has(element.name)
}

export function matchesPlantMapViewFilter(
  element: PlantElementView,
  filter: PlantMapViewFilter,
  eventCellCodes: Set<string>,
): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'free':
      return element.status === 'free' || element.status === 'idle'
    case 'in_production':
      return isInProductionElement(element)
    case 'with_events':
      return elementHasEvents(element, eventCellCodes)
    default:
      return true
  }
}

export function viewFilterClass(
  element: PlantElementView,
  filter: PlantMapViewFilter,
  eventCellCodes: Set<string>,
): string {
  if (filter === 'all') return ''
  const matches = matchesPlantMapViewFilter(element, filter, eventCellCodes)
  return matches ? ' plant-element--filter-match' : ' plant-element--filter-dim'
}
