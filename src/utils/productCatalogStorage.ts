import type { MockProduct } from '../data/mockProducts'
import { MOCK_PRODUCTS } from '../data/mockProducts'

const CUSTOM_PRODUCTS_KEY = 'cmsa-custom-products'

export interface NewReferenceInput {
  referenciaProducto: string
  barcode: string
  variedad: string
  calibre: string
  formatoCaja: string
  uso: string
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

function buildProduct(id: string, input: NewReferenceInput): MockProduct {
  const nombre = `Naranja ${input.variedad.trim()} calibre ${input.calibre.trim()}`
  return {
    id,
    referenciaProducto: input.referenciaProducto.trim(),
    barcode: input.barcode.trim(),
    nombre,
    producto: 'Naranja',
    variedad: input.variedad.trim(),
    grupo: 'Custom',
    calibre: input.calibre.trim(),
    formatoCaja: input.formatoCaja.trim(),
    uso: input.uso.trim() || 'Mesa',
    tipo: input.uso.trim() || 'Mesa',
    cajasHoraSugeridas: input.cajasHoraSugeridas,
    descripcion: `Referencia mock · ${input.referenciaProducto.trim()}`,
    activo: input.activo,
  }
}

export function saveCustomReference(input: NewReferenceInput): MockProduct {
  const id = `custom-${Date.now()}`
  const product = buildProduct(id, input)
  const existing = readCustomProducts()
  writeCustomProducts([product, ...existing])
  return product
}

export function updateCustomReference(id: string, input: NewReferenceInput): MockProduct | null {
  const custom = readCustomProducts()
  const idx = custom.findIndex((p) => p.id === id)
  if (idx < 0) return null
  const product = buildProduct(id, input)
  custom[idx] = product
  writeCustomProducts(custom)
  return product
}

export function toggleCustomReferenceActive(id: string, activo: boolean): void {
  const custom = readCustomProducts()
  const idx = custom.findIndex((p) => p.id === id)
  if (idx < 0) return
  custom[idx] = { ...custom[idx], activo }
  writeCustomProducts(custom)
}

export function referenceExists(referenciaProducto: string): boolean {
  const ref = referenciaProducto.trim().toLowerCase()
  return getAllCatalogProducts().some((p) => p.referenciaProducto.toLowerCase() === ref)
}
