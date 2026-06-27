import type { BacklogKpiCounts } from '../types/backlog'

export type BacklogHeroStatus = 'ok' | 'pending_validation' | 'incidents'

export function getBacklogHeroStatus(counts: BacklogKpiCounts): BacklogHeroStatus {
  if (counts.blocked > 0) return 'incidents'
  if (counts.pendingValidation > 0) return 'pending_validation'
  return 'ok'
}

export function getBacklogHeroMessageKey(status: BacklogHeroStatus): 'heroOk' | 'heroPendingValidation' | 'heroIncidents' {
  if (status === 'incidents') return 'heroIncidents'
  if (status === 'pending_validation') return 'heroPendingValidation'
  return 'heroOk'
}
