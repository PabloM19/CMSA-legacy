import { useMemo, useState } from 'react'
import { BookOpen, PlusCircle } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { MockProduct } from '../../../data/mockProducts'
import {
  getAllCatalogProducts,
  toggleCustomReferenceActive,
} from '../../../utils/productCatalogStorage'
import { AddReferenceModal } from '../../orders/components/AddReferenceModal'
import { AdminSearchBar } from './AdminSearchBar'
import { AdminEmptyState } from './AdminEmptyState'

interface ReferencesTabProps {
  refreshKey: number
  canManage?: boolean
  onChanged?: () => void
  showHeader?: boolean
}

export function ReferencesTab({
  refreshKey,
  canManage = false,
  onChanged,
  showHeader = true,
}: ReferencesTabProps) {
  const { t } = useLanguage()
  const d = t.admin
  const r = t.references

  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editProduct, setEditProduct] = useState<MockProduct | null>(null)
  const [detailProduct, setDetailProduct] = useState<MockProduct | null>(null)
  const [localVersion, setLocalVersion] = useState(0)

  const products = useMemo(() => {
    void refreshKey
    void localVersion
    return getAllCatalogProducts()
  }, [refreshKey, localVersion])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      [
        p.referenciaProducto,
        p.barcode,
        p.variedad,
        p.calibre,
        p.formatoCaja,
        p.uso,
        p.producto,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [products, query])

  function bump() {
    setLocalVersion((v) => v + 1)
    onChanged?.()
  }

  function handleToggleActive(product: MockProduct) {
    if (!product.id.startsWith('custom-')) return
    toggleCustomReferenceActive(product.id, !product.activo)
    bump()
  }

  return (
    <section className="admin-section dash-card admin-tab">
      <div className="admin-section__intro">
        <div className="admin-section__icon" aria-hidden="true">
          <BookOpen size={32} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="admin-section__title">{showHeader ? r.title : d.tabs.references}</h2>
          <p className="admin-section__desc">{showHeader ? r.subtitle : d.sectionReferencesDesc}</p>
        </div>
      </div>

      <div className="admin-tab__toolbar">
        <AdminSearchBar
          value={query}
          onChange={setQuery}
          placeholder={r.searchPlaceholder}
          resultCount={filtered.length}
        />
        {canManage && (
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => setShowAdd(true)}
          >
            <PlusCircle size={18} aria-hidden="true" />
            {r.addBtn}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <div className="admin-table-wrap" role="region" aria-label={r.title}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{r.colReference}</th>
                <th>{r.colBarcode}</th>
                <th>{r.colProduct}</th>
                <th>{t.backlog.variety}</th>
                <th>{r.colCalibre}</th>
                <th>{r.colFormat}</th>
                <th>{r.colUsage}</th>
                <th>{t.backlog.boxesPerHour}</th>
                <th>{d.colStatus}</th>
                <th>{d.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className={!product.activo ? 'admin-table__row--muted' : ''}>
                  <td className="admin-table__cell-ref">{product.referenciaProducto}</td>
                  <td className="admin-table__cell-mono">{product.barcode}</td>
                  <td>{product.producto}</td>
                  <td>{product.variedad}</td>
                  <td>{product.calibre}</td>
                  <td>{product.formatoCaja}</td>
                  <td>{product.uso}</td>
                  <td>{product.cajasHoraSugeridas}</td>
                  <td>
                    <span
                      className={`admin-badge admin-badge--${product.activo ? 'ok' : 'off'}`}
                    >
                      {product.activo ? d.statusActiveF : d.statusInactiveF}
                    </span>
                  </td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => setDetailProduct(product)}
                    >
                      {r.viewDetail}
                    </button>
                    {canManage && product.id.startsWith('custom-') && (
                      <>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          onClick={() => setEditProduct(product)}
                        >
                          {r.edit}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--sm"
                          onClick={() => handleToggleActive(product)}
                        >
                          {product.activo ? r.deactivate : r.activate}
                        </button>
                      </>
                    )}
                    {canManage && !product.id.startsWith('custom-') && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        disabled
                        title={r.seedReadonlyHint}
                      >
                        {r.deactivate}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddReferenceModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            bump()
            setShowAdd(false)
          }}
        />
      )}

      {editProduct && (
        <AddReferenceModal
          initial={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={() => {
            bump()
            setEditProduct(null)
          }}
        />
      )}

      {detailProduct && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setDetailProduct(null)}>
          <div
            className="order-modal order-modal--neutral"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="order-modal__head">
              <h2 className="order-modal__title">{detailProduct.referenciaProducto}</h2>
              <p className="order-modal__subtitle">{detailProduct.nombre}</p>
            </header>
            <dl className="order-modal__dl">
              <div className="order-modal__row">
                <dt>{r.colBarcode}</dt>
                <dd>{detailProduct.barcode}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{r.colProduct}</dt>
                <dd>{detailProduct.producto}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{t.backlog.variety}</dt>
                <dd>{detailProduct.variedad}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{r.colCalibre}</dt>
                <dd>{detailProduct.calibre}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{r.colFormat}</dt>
                <dd>{detailProduct.formatoCaja}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{r.colUsage}</dt>
                <dd>{detailProduct.uso}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{t.backlog.boxesPerHour}</dt>
                <dd>{detailProduct.cajasHoraSugeridas}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colStatus}</dt>
                <dd>{detailProduct.activo ? d.statusActiveF : d.statusInactiveF}</dd>
              </div>
            </dl>
            <div className="order-modal__actions">
              <button type="button" className="order-btn order-btn--primary" onClick={() => setDetailProduct(null)}>
                {t.backlog.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
