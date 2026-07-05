/** Límites mock para demo — no son reglas de negocio definitivas. */
export const DEMO_LIMITS = {
  dailyOrder: {
    warnHigh: 50_000,
    block: 150_000,
  },
  productionOrder: {
    normalMin: 500,
    normalMax: 20_000,
    warnHigh: 25_000,
    block: 60_000,
  },
  boxesPerHour: {
    normalMin: 500,
    normalMax: 10_000,
    warnHigh: 12_000,
    block: 25_000,
  },
  layerMultiple: 10,
} as const

export type LimitCheck = {
  blocked: boolean
  warnings: string[]
}
