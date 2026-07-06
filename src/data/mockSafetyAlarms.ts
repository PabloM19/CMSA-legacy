export type SafetyAlarmStatus = 'active' | 'reviewed' | 'resolved'

export interface RealSafetyAlarm {
  id: string
  time: string
  cellOrZone: string
  type: string
  status: SafetyAlarmStatus
  message: string
}

export const MOCK_REAL_SAFETY_ALARMS: RealSafetyAlarm[] = [
  {
    id: 'SAF-001',
    time: '11:42',
    cellOrZone: 'Zona Norte',
    type: 'Puerta abierta',
    status: 'resolved',
    message: 'Módulo de seguridad activado por puerta abierta.',
  },
  {
    id: 'SAF-002',
    time: '11:56',
    cellOrZone: 'R6',
    type: 'Seta pulsada',
    status: 'active',
    message: 'Parada de emergencia activada.',
  },
  {
    id: 'SAF-003',
    time: '12:08',
    cellOrZone: 'Zona Sur',
    type: 'Seguridad industrial',
    status: 'reviewed',
    message: 'Bloqueo de seguridad revisado por supervisor.',
  },
]

export function getRealSafetyAlarms(): RealSafetyAlarm[] {
  return MOCK_REAL_SAFETY_ALARMS
}
