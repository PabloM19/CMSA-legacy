export type CpkLevel = 'green' | 'yellow' | 'red'

export type CpkTone = 'success' | 'warning' | 'danger'

const CPK_GREEN_MIN = 1.33
const CPK_YELLOW_MIN = 1.0

export function getCpkLevel(cpk: number): CpkLevel {
  if (cpk >= CPK_GREEN_MIN) return 'green'
  if (cpk >= CPK_YELLOW_MIN) return 'yellow'
  return 'red'
}

export function getCpkTone(cpk: number): CpkTone {
  const level = getCpkLevel(cpk)
  if (level === 'green') return 'success'
  if (level === 'yellow') return 'warning'
  return 'danger'
}

export const CPK_STATUS_LABEL_KEY: Record<
  CpkLevel,
  'cpkRangeGreenLabel' | 'cpkRangeYellowLabel' | 'cpkRangeRedLabel'
> = {
  green: 'cpkRangeGreenLabel',
  yellow: 'cpkRangeYellowLabel',
  red: 'cpkRangeRedLabel',
}
