import { useMemo } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DailyOrder } from '../../../types/dailyOrder'
import { findProductByReference } from '../../../utils/productSearch'
import {
  getReferenceHeights,
  getReferencePalletType,
} from '../../../utils/referenceDisplayHelpers'
import { ReadOnlyInfoField } from './ReadOnlyInfoField'

interface DailyOrderDetailModalProps {
  daily: DailyOrder
  onClose: () => void
}

function fmt(n: number, lang: 'es' | 'en') {
  return n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')
}

function formatDailyOrderStatus(estado: DailyOrder['estado'], lang: 'es' | 'en'): string {
  const labels: Record<DailyOrder['estado'], { es: string; en: string }> = {
    pendiente: { es: 'Pendiente', en: 'Pending' },
    parcialmente_asignado: { es: 'Parcialmente asignado', en: 'Partially assigned' },
    en_produccion: { es: 'En producción', en: 'In production' },
    completado: { es: 'Completado', en: 'Completed' },
    ampliado: { es: 'Ampliado', en: 'Expanded' },
    bloqueado: { es: 'Bloqueado', en: 'Blocked' },
  }
  return labels[estado][lang]
}

export function DailyOrderDetailModal({ daily, onClose }: DailyOrderDetailModalProps) {
  const { t, lang } = useLanguage()
  const d = t.dailyOrdersPage
  const b = t.backlog

  const catalogProduct = useMemo(
    () => findProductByReference(daily.referencia) ?? null,
    [daily.referencia],
  )

  const palletType = catalogProduct ? getReferencePalletType(catalogProduct) : '—'
  const heights = catalogProduct ? getReferenceHeights(catalogProduct) : '—'

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="order-modal order-modal--neutral daily-order-detail-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="order-modal__title">{d.detailTitle}</h2>

        <div className="daily-order-detail-modal__readonly-grid">
          <ReadOnlyInfoField label={b.reference} value={daily.referencia} mono />
          <ReadOnlyInfoField label={b.colVariety} value={daily.variedad} />
          <ReadOnlyInfoField label={b.company} value={daily.empresa} />
          <ReadOnlyInfoField label={b.colBarcode} value={daily.barcode} mono />
          <ReadOnlyInfoField label={d.detailPalletType} value={palletType} />
          <ReadOnlyInfoField label={d.detailHeights} value={heights} />
          <ReadOnlyInfoField label={b.colBoxFormat} value={daily.estilo} />
          <ReadOnlyInfoField
            label={b.status}
            value={formatDailyOrderStatus(daily.estado, lang)}
          />
        </div>

        <dl className="order-modal__dl daily-order-detail-modal__metrics">
          <div className="order-modal__row">
            <dt>{b.colTotalDay}</dt>
            <dd>{fmt(daily.totalCajasDia, lang)}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{b.colAssigned}</dt>
            <dd>{fmt(daily.cajasAsignadas, lang)}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{b.colCompleted}</dt>
            <dd>{fmt(daily.cajasCompletadas, lang)}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{b.colRemaining}</dt>
            <dd>{fmt(daily.cajasRestantes, lang)}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{b.colProgress}</dt>
            <dd>
              {daily.porcentajeAsignado}% / {daily.porcentajeCompletado}%
            </dd>
          </div>
        </dl>

        <div className="admin-modal__foot">
          <button type="button" className="admin-btn admin-btn--primary" onClick={onClose}>
            {b.close}
          </button>
        </div>
      </div>
    </div>
  )
}
