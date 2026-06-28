import type { MockProduct } from '../data/mockProducts'
import {
  FEATURED_PRODUCT_COUNT,
  getActiveProducts,
  SEARCH_RESULT_LIMIT,
} from '../data/mockProducts'

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function productHaystack(product: MockProduct): string {
  return [
    product.referenciaProducto,
    product.nombre,
    product.producto,
    product.variedad,
    product.tipo,
    product.formatoCaja,
    product.descripcion ?? '',
  ]
    .join(' ')
    .toLowerCase()
}

export function filterProducts(query: string): MockProduct[] {
  const active = getActiveProducts()
  const trimmed = query.trim()

  if (!trimmed) {
    return active.slice(0, FEATURED_PRODUCT_COUNT)
  }

  const terms = normalize(trimmed).split(/\s+/).filter(Boolean)

  return active
    .filter((product) => {
      const haystack = productHaystack(product)
      return terms.every((term) => haystack.includes(term))
    })
    .slice(0, SEARCH_RESULT_LIMIT)
}

export function getDisplayProducts(query: string): MockProduct[] {
  return filterProducts(query)
}

export function isSearchActive(query: string): boolean {
  return query.trim().length > 0
}
