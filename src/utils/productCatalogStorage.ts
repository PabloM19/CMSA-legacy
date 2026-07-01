import type { MockProduct } from '../data/mockProducts'
import { MOCK_PRODUCTS } from '../data/mockProducts'

const CUSTOM_PRODUCTS_KEY = 'cmsa-custom-products'

export interface NewReferenceInput {
  referenciaProducto: string
  barcode: string
  variedad: string
  calibre: string
  formatoCaja: string
  cajasHoraSugeridas: number
  activo: boolean
}

function readCustomProducts(): MockProduct[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as MockProduct[]
  } catch {
    return []
  }
}

function writeCustomProducts(products: MockProduct[]): void {
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(products))
}

export function getCustomProducts(): MockProduct[] {
  return readCustomProducts()
}

export function getAllCatalogProducts(): MockProduct[] {
  return [...MOCK_PRODUCTS, ...readCustomProducts()]
}

export function saveCustomReference(input: NewReferenceInput): MockProduct {
  const id = `custom-${Date.now()}`
  const nombre = `Naranja ${input.variedad} calibre ${input.calibre}`

  const product: MockProduct = {
    id,
    referenciaProducto: input.referenciaProducto.trim(),
    barcode: input.barcode.trim(),
    nombre,
    producto: 'Naranja',
    variedad: input.variedad.trim(),
    grupo: 'Custom',
    calibre: input.calibre.trim(),
    formatoCaja: input.formatoCaja.trim(),
    uso: 'Mesa',
    tipo: 'Mesa',
    cajasHoraSugeridas: input.cajasHoraSugeridas,
    descripcion: `Referencia mock añadida · ${input.referenciaProducto}`,
    activo: input.activo,
  }

  const existing = readCustomProducts()
  writeCustomProducts([product, ...existing])
  return product
}

export function referenceExists(referenciaProducto: string): boolean {
  const ref = referenciaProducto.trim().toLowerCase()
  return getAllCatalogProducts().some((p) => p.referenciaProducto.toLowerCase() === ref)
}
