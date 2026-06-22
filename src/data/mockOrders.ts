import type { Order } from '../types/orders'

export const mockOrders: Order[] = [
  {
    id: 'o1',
    code: 'ORD-2024-001',
    product: 'Chasis A12',
    quantity: 50,
    status: 'in_progress',
    createdAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'o2',
    code: 'ORD-2024-002',
    product: 'Panel lateral B3',
    quantity: 120,
    status: 'pending',
    createdAt: '2024-06-02T10:30:00Z',
  },
  {
    id: 'o3',
    code: 'ORD-2024-003',
    product: 'Ensamble C7',
    quantity: 30,
    status: 'validation',
    createdAt: '2024-06-03T14:15:00Z',
  },
]
