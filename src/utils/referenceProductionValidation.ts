import type { BacklogOrder } from '../types/backlog'
import type { DailyOrder } from '../types/dailyOrder'
import type { MockProduct } from '../data/mockProducts'
import { getReferenceHeights, getReferencePalletType } from './referenceDisplayHelpers'
import { findProductByReference } from './productSearch'
import { getAllCatalogProducts } from './productCatalogStorage'

export interface ReferenceProductionConfig {
  referenciaId: string
  barcode: string
  variedad: string
  tipoPalet: string
  alturas: string
}

export interface BarcodeProductionConflictDetails {
  activeOrder: BacklogOrder
  activeConfig: ReferenceProductionConfig
  candidateConfig: ReferenceProductionConfig
}

function normalizeBarcode(barcode: string | undefined): string {
  return barcode?.trim() ?? ''
}

export function getConfigFromProduct(product: MockProduct): ReferenceProductionConfig {
  return {
    referenciaId: product.referenciaProducto,
    barcode: normalizeBarcode(product.barcode),
    variedad: product.variedad,
    tipoPalet: getReferencePalletType(product),
    alturas: getReferenceHeights(product),
  }
}

export function getConfigFromDailyOrder(
  daily: DailyOrder,
  product?: MockProduct | null,
): ReferenceProductionConfig {
  const catalog = product ?? findProductByReference(daily.referencia) ?? null
  return {
    referenciaId: daily.referencia,
    barcode: normalizeBarcode(daily.barcode || catalog?.barcode),
    variedad: daily.variedad,
    tipoPalet: catalog ? getReferencePalletType(catalog) : daily.estilo,
    alturas: catalog ? getReferenceHeights(catalog) : '—',
  }
}

function resolveProductForOrder(order: BacklogOrder): MockProduct | undefined {
  if (order.productReference?.trim()) {
    return findProductByReference(order.productReference)
  }

  const ref = order.reference.trim()
  if (ref.startsWith('REF-')) {
    return findProductByReference(ref)
  }

  const barcode = normalizeBarcode(order.barcode)
  if (!barcode) return undefined

  const matches = getAllCatalogProducts().filter((p) => normalizeBarcode(p.barcode) === barcode)
  if (matches.length === 1) return matches[0]
  return undefined
}

export function getConfigFromProductionOrder(order: BacklogOrder): ReferenceProductionConfig | null {
  const barcode = normalizeBarcode(order.barcode)
  if (!barcode) return null

  const product = resolveProductForOrder(order)
  const referenciaId = order.productReference?.trim() || product?.referenciaProducto || order.reference

  return {
    referenciaId,
    barcode,
    variedad: order.variety,
    tipoPalet: product ? getReferencePalletType(product) : '—',
    alturas: product ? getReferenceHeights(product) : '—',
  }
}

/** Orden activa en producción (lanzada o en línea). */
export function isActiveBarcodeProductionOrder(order: BacklogOrder): boolean {
  if (order.productionState === 'withdrawn') return false
  return order.column === 'en_preparacion' || order.column === 'en_produccion'
}

function hasDifferentPalletOrHeights(
  a: ReferenceProductionConfig,
  b: ReferenceProductionConfig,
): boolean {
  return a.tipoPalet !== b.tipoPalet || a.alturas !== b.alturas
}

/** Conflicto: mismo barcode en producción con palé o alturas distintas. */
export function findBarcodeProductionConflict(
  candidate: ReferenceProductionConfig,
  productionOrders: BacklogOrder[],
): BacklogOrder | null {
  if (!candidate.barcode) return null

  for (const order of productionOrders) {
    if (!isActiveBarcodeProductionOrder(order)) continue
    const existing = getConfigFromProductionOrder(order)
    if (!existing) continue
    if (existing.barcode !== candidate.barcode) continue
    if (hasDifferentPalletOrHeights(candidate, existing)) return order
  }

  return null
}

export function hasBarcodeProductionConflict(
  daily: DailyOrder,
  productionOrders: BacklogOrder[],
  product?: MockProduct | null,
): boolean {
  const candidate = getConfigFromDailyOrder(daily, product)
  return findBarcodeProductionConflict(candidate, productionOrders) !== null
}

export function getBarcodeProductionConflict(
  daily: DailyOrder,
  productionOrders: BacklogOrder[],
  product?: MockProduct | null,
): BarcodeProductionConflictDetails | null {
  const candidateConfig = getConfigFromDailyOrder(daily, product)
  const activeOrder = findBarcodeProductionConflict(candidateConfig, productionOrders)
  if (!activeOrder) return null

  const activeConfig = getConfigFromProductionOrder(activeOrder)
  if (!activeConfig) return null

  return { activeOrder, activeConfig, candidateConfig }
}

export function formatPalletConfigLabel(
  tipoPalet: string,
  alturas: string,
  heightsUnit: string,
): string {
  return `${tipoPalet} · ${alturas} ${heightsUnit}`
}
