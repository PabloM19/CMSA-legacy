/** Orden visual fiel al plano físico (izquierda → derecha). */
export const PLANT_UPPER_ROW = [
  'M3',
  'M2',
  'M1',
  'R9',
  'R8',
  'R7',
  'R6',
  'R5',
  'R4',
  'R3',
  'R2',
  'R1',
] as const

export const PLANT_LOWER_ROW = [
  'M7',
  'M6',
  'M5',
  'M4',
  'P8',
  'P7',
  'P6',
  'P5',
  'P4',
  'P3',
  'P2',
  'P1',
] as const

export type PlantLayoutSlotId = (typeof PLANT_UPPER_ROW)[number] | (typeof PLANT_LOWER_ROW)[number]
