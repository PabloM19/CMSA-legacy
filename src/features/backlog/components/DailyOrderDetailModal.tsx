import { useLanguage } from '../../../i18n/LanguageContext'
import type { DailyOrder } from '../../../types/dailyOrder'
import { CompanyBadge } from '../../../components/ui/StatusBadge'

interface DailyOrderDetailModalProps {
  daily: DailyOrder
  onClose: () => void
}

function fmt(n: number, lang: 'es' | 'en') {
  return n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')
}

export function DailyOrderDetailModal({ daily, onClose }: DailyOrderDetailModalProps) {
  const { t, lang } = useLanguage()
  const d = t.dailyOrdersPage
  const b = t.backlog

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="order-modal order-modal--neutral"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="order-modal__title">{d.detailTitle}</h2>
        <dl className="order-modal__dl">
          <div className="order-modal__row">
            <dt>{b.colVariety}</dt>
            <dd>{daily.variedad}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{b.reference}</dt>
            <dd>{daily.referencia}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{b.colBoxFormat}</dt>
            <dd>{daily.estilo}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{b.colBarcode}</dt>
            <dd className="admin-table__cell-mono">{daily.barcode}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{b.company}</dt>
            <dd>
              <CompanyBadge company={daily.empresa} />
            </dd>
          </div>
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
