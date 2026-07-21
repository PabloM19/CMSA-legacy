import { useMemo } from 'react'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import { CompanyBadge, StatusBadge } from '../../../components/ui/StatusBadge'
import type { BacklogOrder } from '../../../types/backlog'
import { findProductByReference } from '../../../utils/productSearch'
import { getAllCatalogProducts } from '../../../utils/productCatalogStorage'
import {
  getReferenceHeights,
  getReferencePalletType,
} from '../../../utils/referenceDisplayHelpers'
import { formatOrderStationList } from '../../../utils/productionOrderValidation'
import { getColumnStatusBadge } from '../../../utils/statusBadge'
import { ReadOnlyInfoField } from './ReadOnlyInfoField'

interface OrderDetailModalProps {
  order: BacklogOrder
  onClose: () => void
  onWithdraw?: () => void
  onMarkIncident?: () => void
  onCancel?: () => void
  onValidateTables?: () => void
}

function resolveCatalogProduct(order: BacklogOrder) {
  const reference = order.reference.trim()
  if (reference.startsWith('REF-')) {
    return findProductByReference(reference)
  }

  const barcode = order.barcode?.trim()
  if (!barcode) return undefined

  const matches = getAllCatalogProducts().filter((product) => product.barcode?.trim() === barcode)
  return matches.length === 1 ? matches[0] : undefined
}

export function OrderDetailModal({
  order,
  onClose,
  onWithdraw,
  onMarkIncident,
  onCancel,
  onValidateTables,
}: OrderDetailModalProps) {
  const { user } = useAuth()
  const { t, lang, dateLocale } = useLanguage()
  const d = t.backlog
  const dailyLabels = t.dailyOrdersPage

  const catalogProduct = useMemo(() => resolveCatalogProduct(order), [order])
  const palletType = catalogProduct ? getReferencePalletType(catalogProduct) : order.estilo ?? '—'
  const heights = catalogProduct ? getReferenceHeights(catalogProduct) : '—'
  const tablesDisplay = formatOrderStationList(order)

  const statusBadge = getColumnStatusBadge(order.column, lang)
  const columnLabel = d.columns[order.column]

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="order-modal order-modal--neutral backlog-detail daily-order-detail-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="backlog-detail__hero">
          <div className="backlog-detail__hero-main">
            <h2 className="order-modal__title">{order.reference}</h2>
            <div className="backlog-detail__hero-badges">
              <CompanyBadge company={order.company} />
              <StatusBadge label={columnLabel} variant={statusBadge.variant} />
            </div>
          </div>
          <p className="backlog-detail__hero-product">
            {order.product} · {order.variety}
          </p>
        </header>

        <div className="daily-order-detail-modal__readonly-grid">
          <ReadOnlyInfoField label={d.reference} value={order.reference} mono />
          <ReadOnlyInfoField label={d.colVariety} value={order.variety} />
          <ReadOnlyInfoField label={d.company} value={order.company} />
          <ReadOnlyInfoField label={d.colBarcode} value={order.barcode ?? '—'} mono />
          <ReadOnlyInfoField label={dailyLabels.detailPalletType} value={palletType} />
          <ReadOnlyInfoField label={dailyLabels.detailHeights} value={heights} />
          <ReadOnlyInfoField label={d.colBoxFormat} value={order.estilo ?? '—'} />
          <ReadOnlyInfoField label={d.assignedTables} value={tablesDisplay} />
        </div>

        <dl className="order-modal__dl daily-order-detail-modal__metrics">
          <div className="order-modal__row">
            <dt>{d.boxes}</dt>
            <dd>{order.boxes.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.boxesPerHour}</dt>
            <dd>{order.boxesPerHour.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.etc}</dt>
            <dd>{order.etc}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.endTime}</dt>
            <dd>{order.endTime}</dd>
          </div>
        </dl>

        <section className="backlog-detail__section">
          <h3 className="order-modal__section-title">{d.alerts}</h3>
          {order.alerts.length === 0 ? (
            <p className="order-modal__no-alerts">{d.noAlerts}</p>
          ) : (
            <ul className="backlog-detail__alerts">
              {order.alerts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="backlog-detail__section">
          <h3 className="order-modal__section-title">{d.history}</h3>
          {order.auditTrail.length === 0 ? (
            <p className="order-modal__no-alerts">{d.noHistory}</p>
          ) : (
            <ul className="backlog-detail__history">
              {order.auditTrail.map((entry) => (
                <li key={entry.id}>
                  <span>{entry.action}</span>
                  <time dateTime={entry.timestamp}>
                    {new Date(entry.timestamp).toLocaleString(dateLocale, {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {entry.user ? ` · ${entry.user}` : ''}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="order-modal__actions backlog-detail__actions">
          {onValidateTables && (
            <button type="button" className="order-btn order-btn--ghost" onClick={onValidateTables}>
              {d.validateTables}
              <span className="backlog-card__demo-tag">{d.demo}</span>
            </button>
          )}
          {onWithdraw && (
            <button type="button" className="order-btn order-btn--danger" onClick={onWithdraw}>
              {d.withdrawAction}
            </button>
          )}
          {user?.role === 'superadmin' && onMarkIncident && (
            <button type="button" className="order-btn order-btn--ghost" onClick={onMarkIncident}>
              {d.markIncident}
            </button>
          )}
          {user?.role === 'superadmin' && onCancel && (
            <button type="button" className="order-btn order-btn--danger" onClick={onCancel}>
              {d.cancelOrder}
            </button>
          )}
          <button type="button" className="order-btn order-btn--primary" onClick={onClose}>
            {d.close}
          </button>
        </div>
      </div>
    </div>
  )
}
