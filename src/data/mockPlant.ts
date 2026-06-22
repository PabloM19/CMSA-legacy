import type { PlantZone } from '../types/plant'

export const mockPlantZones: PlantZone[] = [
  {
    id: 'z1',
    name: 'Línea 1 — Ensamble',
    status: 'active',
    capacity: 10,
    occupied: 7,
  },
  {
    id: 'z2',
    name: 'Línea 2 — Pintura',
    status: 'idle',
    capacity: 8,
    occupied: 0,
  },
  {
    id: 'z3',
    name: 'Zona de validación',
    status: 'active',
    capacity: 4,
    occupied: 3,
  },
]
