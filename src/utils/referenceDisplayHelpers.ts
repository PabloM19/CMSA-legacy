import type { MockProduct } from '../data/mockProducts'

/** Tipo de palé asociado a la referencia del catálogo mock. */
export function getReferencePalletType(product: MockProduct): string {
  if (product.tipoPalet?.trim()) return product.tipoPalet.trim()

  const rpc = product.formatoCaja.match(/(\d{4}\s*RPC)/i)
  if (rpc) return rpc[1].toUpperCase()

  if (product.formatoCaja.toLowerCase().includes('premium')) return 'Premium Pack'
  if (product.uso === 'Industria') return 'Industrial RPC'
  if (product.uso === 'Zumo') return 'Bulk Tote'
  return 'Display Pack'
}

/** Número de alturas asociado a la referencia (derivado del catálogo mock). */
export function getReferenceHeights(product: MockProduct): string {
  if (product.alturas?.trim()) return product.alturas.trim()

  const rpc = product.formatoCaja.match(/(\d{4})\s*RPC/i)
  if (rpc) return String(rpc[1].length)

  const ct = product.formatoCaja.match(/(\d+)\s*ct/i)
  if (ct) return ct[1]

  if (product.calibre === 'S') return '4'
  if (product.calibre === 'M') return '5'
  if (product.calibre === 'L') return '6'
  return '4'
}
