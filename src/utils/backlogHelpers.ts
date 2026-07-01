import type { BacklogKpiCounts } from '../types/backlog'

export type BacklogHeroStatus = 'ok' | 'pending_preparation' | 'incidents'

export function getBacklogHeroStatus(counts: BacklogKpiCounts): BacklogHeroStatus {
  if (counts.inPreparation > 0) return 'pending_preparation'
  return 'ok'
}

export function getBacklogHeroMessageKey(
  status: BacklogHeroStatus,
): 'heroOk' | 'heroPendingPreparation' | 'heroIncidents' {
  if (status === 'incidents') return 'heroIncidents'
  if (status === 'pending_preparation') return 'heroPendingPreparation'
  return 'heroOk'
}
