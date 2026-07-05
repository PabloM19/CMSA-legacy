import type { DailyOrder } from '../types/dailyOrder'

function ev(action: string, user = 'Sistema', detail?: string): DailyOrder['events'][0] {
  return {
    id: `ev-seed-${Math.random().toString(36).slice(2, 8)}`,
    at: '2025-01-15T06:00:00.000Z',
    action,
    user,
    detail,
  }
}

function base(
  id: string,
  estilo: string,
  referencia: string,
  barcode: string,
  empresa: 'SUMO' | 'MAF',
  totalCajasDia: number,
  cajasAsignadas: number,
  cajasCompletadas: number,
  ordenesProduccionIds: string[],
  estado: DailyOrder['estado'] = 'parcialmente_asignado',
): DailyOrder {
  const cajasRestantes = Math.max(0, totalCajasDia - cajasAsignadas)
  return {
    id,
    fecha: '2025-01-15',
    estilo,
    referencia,
    barcode,
    empresa,
    producto: 'Naranja',
    variedad: 'Embalaje / estilo',
    totalCajasDia,
    cajasAsignadas,
    cajasCompletadas,
    cajasRestantes,
    porcentajeAsignado: Math.round((cajasAsignadas / totalCajasDia) * 1000) / 10,
    porcentajeCompletado: Math.round((cajasCompletadas / totalCajasDia) * 1000) / 10,
    porcentajeRestante: Math.round((cajasRestantes / totalCajasDia) * 1000) / 10,
    estado,
    ordenesProduccionIds,
    events: [ev('Pedido del día cargado', 'Sistema', estilo)],
  }
}

/** Seed demo — total general 114.016 cajas */
export const mockDailyOrders: DailyOrder[] = [
  base('pd-1', 'Display Pack', 'REF-DISPLAY-PACK', '8437001000012', 'SUMO', 31_220, 24_000, 6_000, [
    'po-dp-1',
    'po-dp-2',
    'po-dp-3',
  ]),
  base('pd-2', 'smCsmr 7ct', 'REF-SMCSMR-7CT', '8437001000029', 'MAF', 31_739, 12_000, 4_000, ['po-sm-1']),
  base('pd-3', 'Cartons', 'REF-CARTONS', '8437001000036', 'SUMO', 24_438, 9_000, 0, ['po-ct-1']),
  base('pd-4', 'Totes/Bags', 'REF-TOTES-BAGS', '8437001000043', 'MAF', 14_784, 6_000, 2_000, ['po-tb-1']),
  base('pd-5', '4 - 3lb Club', 'REF-3LB-CLUB', '8437001000050', 'SUMO', 680, 0, 0, [], 'pendiente'),
  base('pd-6', '7ct', 'REF-7CT', '8437001000067', 'MAF', 5_828, 3_000, 1_500, ['po-7c-1']),
  base('pd-7', 'Consumer Pack', 'REF-CONSUMER-PACK', '8437001000074', 'SUMO', 2_035, 0, 0, [], 'pendiente'),
  base('pd-8', 'Euro 2 piece', 'REF-EURO-2P', '8437001000081', 'MAF', 740, 740, 740, ['po-eu-1'], 'completado'),
  base('pd-9', '1/2 Carton', 'REF-HALF-CARTON', '8437001000098', 'SUMO', 1_956, 1_000, 0, ['po-hc-1']),
  base('pd-10', '6423 RPC', 'REF-6423-RPC', '8437001000104', 'MAF', 396, 0, 0, [], 'pendiente'),
  base('pd-11', '6419 RPC', 'REF-6419-RPC', '8437001000111', 'SUMO', 200, 0, 0, [], 'pendiente'),
]

export const DEMO_DAILY_ORDERS_TOTAL = mockDailyOrders.reduce((s, d) => s + d.totalCajasDia, 0)

export function findDailyOrder(id: string): DailyOrder | undefined {
  return mockDailyOrders.find((d) => d.id === id)
}
