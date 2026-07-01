import { useMemo, useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import { getAllCatalogProducts } from '../../../utils/productCatalogStorage'
import { AdminSearchBar } from './AdminSearchBar'
import { AdminEmptyState } from './AdminEmptyState'

interface ReferencesTabProps {
  refreshKey: number
}

export function ReferencesTab({ refreshKey }: ReferencesTabProps) {
  const { t } = useLanguage()
  const d = t.admin
  const [query, setQuery] = useState('')

  const products = useMemo(() => {
    void refreshKey
    return getAllCatalogProducts()
  }, [refreshKey])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      [p.referenciaProducto, p.nombre, p.variedad, p.barcode].join(' ').toLowerCase().includes(q),
    )
  }, [products, query])

  return (
    <section className="admin-tab">
      <p className="admin-tab__desc">{d.sectionReferencesDesc}</p>
      <AdminSearchBar
        value={query}
        onChange={setQuery}
        placeholder={d.searchReferences}
        resultCount={filtered.length}
      />
      {filtered.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{d.colCode}</th>
                <th>{d.colName}</th>
                <th>{t.backlog.variety}</th>
                <th>{t.backlog.boxesPerHour}</th>
                <th>{d.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>{product.referenciaProducto}</td>
                  <td>{product.nombre}</td>
                  <td>{product.variedad}</td>
                  <td>{product.cajasHoraSugeridas}</td>
                  <td>{product.activo ? d.statusActiveF : d.statusInactiveF}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
