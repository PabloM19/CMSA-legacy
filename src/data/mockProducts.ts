export interface MockProduct {
  id: string
  referenciaProducto: string
  nombre: string
  producto: string
  variedad: string
  tipo: string
  formatoCaja: string
  cajasHoraSugeridas?: number
  descripcion?: string
  activo: boolean
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-nav-001',
    referenciaProducto: 'PROD-NAV-001',
    nombre: 'Naranja Navel',
    producto: 'Naranja',
    variedad: 'Navel',
    tipo: 'Mesa',
    formatoCaja: 'Caja estándar',
    cajasHoraSugeridas: 500,
    descripcion: 'Naranja de mesa, calibre medio-alto.',
    activo: true,
  },
  {
    id: 'prod-lan-002',
    referenciaProducto: 'PROD-LAN-002',
    nombre: 'Naranja Lane Late',
    producto: 'Naranja',
    variedad: 'Lane Late',
    tipo: 'Mesa',
    formatoCaja: 'Caja estándar',
    cajasHoraSugeridas: 480,
    activo: true,
  },
  {
    id: 'prod-val-003',
    referenciaProducto: 'PROD-VAL-003',
    nombre: 'Valencia Late',
    producto: 'Naranja',
    variedad: 'Valencia Late',
    tipo: 'Mesa',
    formatoCaja: 'Caja estándar',
    cajasHoraSugeridas: 520,
    activo: true,
  },
  {
    id: 'prod-cle-004',
    referenciaProducto: 'PROD-CLE-004',
    nombre: 'Clementina fina',
    producto: 'Clementina',
    variedad: 'Fina',
    tipo: 'Mesa',
    formatoCaja: 'Caja pequeña',
    cajasHoraSugeridas: 600,
    activo: true,
  },
  {
    id: 'prod-man-005',
    referenciaProducto: 'PROD-MAN-005',
    nombre: 'Mandarina Oronules',
    producto: 'Mandarina',
    variedad: 'Oronules',
    tipo: 'Mesa',
    formatoCaja: 'Caja estándar',
    cajasHoraSugeridas: 550,
    activo: true,
  },
  {
    id: 'prod-lim-006',
    referenciaProducto: 'PROD-LIM-006',
    nombre: 'Limón Verna',
    producto: 'Limón',
    variedad: 'Verna',
    tipo: 'Manual',
    formatoCaja: 'Caja estándar',
    cajasHoraSugeridas: 400,
    descripcion: 'Requiere apoyo en mesas manuales.',
    activo: true,
  },
  {
    id: 'prod-pom-007',
    referenciaProducto: 'PROD-POM-007',
    nombre: 'Pomelo rojo',
    producto: 'Pomelo',
    variedad: 'Rojo',
    tipo: 'Mesa',
    formatoCaja: 'Caja grande',
    cajasHoraSugeridas: 350,
    activo: true,
  },
  {
    id: 'prod-per-008',
    referenciaProducto: 'PROD-PER-008',
    nombre: 'Pera conferencia',
    producto: 'Pera',
    variedad: 'Conferencia',
    tipo: 'Manual',
    formatoCaja: 'Caja estándar',
    cajasHoraSugeridas: 420,
    activo: true,
  },
  {
    id: 'prod-tom-009',
    referenciaProducto: 'PROD-TOM-009',
    nombre: 'Tomate pera',
    producto: 'Tomate',
    variedad: 'Pera',
    tipo: 'Mesa',
    formatoCaja: 'Caja estándar',
    cajasHoraSugeridas: 800,
    activo: true,
  },
  {
    id: 'prod-cal-010',
    referenciaProducto: 'PROD-CAL-010',
    nombre: 'Calabacín negro',
    producto: 'Calabacín',
    variedad: 'Negro',
    tipo: 'Mesa',
    formatoCaja: 'Caja estándar',
    cajasHoraSugeridas: 700,
    activo: true,
  },
]

export const FEATURED_PRODUCT_COUNT = 3
export const SEARCH_RESULT_LIMIT = 5

export function getActiveProducts(): MockProduct[] {
  return MOCK_PRODUCTS.filter((p) => p.activo)
}

export function getFeaturedProducts(): MockProduct[] {
  return getActiveProducts().slice(0, FEATURED_PRODUCT_COUNT)
}

export function findProductById(id: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id)
}
