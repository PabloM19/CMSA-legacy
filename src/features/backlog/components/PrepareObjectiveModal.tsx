import { useMemo, useState } from 'react'
import { CompanyBadge } from '../../../components/ui/StatusBadge'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogOrder } from '../../../types/backlog'
import type { PlantTable } from '../../../types/plant'
import { recommendStations, reserveStationsForOrder } from '../../../utils/preparationHelpers'

interface PrepareObjectiveModalProps {
  order: BacklogOrder
  plantTables: PlantTable[]
  onClose: () => void
  onConfirm: (order: BacklogOrder, plantTables: PlantTable[]) => void
}

export function PrepareObjectiveModal({
  order,
  plantTables,
  onClose,
  onConfirm,
}: PrepareObjectiveModalProps) {
  const { t } = useLanguage()
  const d = t.backlog

  const { recommended, available } = useMemo(
    () => recommendStations(order, plantTables),
    [order, plantTables],
  )

  const [selected, setSelected] = useState<string[]>(() => [...recommended])
  const [error, setError] = useState<string | null>(null)

  const needed = Math.max(2, order.requiredTables)

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
    setError(null)
  }

  function acceptRecommendation() {
    setSelected([...recommended])
    setError(null)
  }

  function handleConfirm() {
    const result = reserveStationsForOrder(order, plantTables, selected)
    if (!result.success) {
      setError(result.message ?? d.prepareError)
      return
    }
    onConfirm(result.order, result.plantTables)
  }

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="order-modal order-modal--neutral order-modal--prepare"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prepare-objective-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="order-modal__head">
          <h2 id="prepare-objective-title" className="order-modal__title">
            {d.prepareModalTitle}
          </h2>
          <p className="order-modal__subtitle">{d.prepareModalSubtitle}</p>
        </header>

        <div className="order-modal__body prepare-modal">
          <dl className="prepare-modal__summary">
            <div>
              <dt>{d.reference}</dt>
              <dd>{order.reference}</dd>
            </div>
            <div>
              <dt>{d.company}</dt>
              <dd>
                <CompanyBadge company={order.company} />
              </dd>
            </div>
            <div>
              <dt>{d.variety}</dt>
              <dd>{order.variety}</dd>
            </div>
            <div>
              <dt>{d.boxes}</dt>
              <dd>{order.boxes.toLocaleString()}</dd>
            </div>
            <div>
              <dt>{d.tablesNeeded}</dt>
              <dd>{needed}</dd>
            </div>
          </dl>

          <div className="prepare-modal__recommend">
            <p className="prepare-modal__recommend-label">{d.prepareRecommendation}</p>
            <p className="prepare-modal__recommend-value">
              {recommended.length > 0 ? recommended.join(', ') : d.prepareNoStations}
            </p>
            <button type="button" className="order-btn order-btn--ghost" onClick={acceptRecommendation}>
              {d.prepareAcceptRecommendation}
            </button>
          </div>

          <fieldset className="prepare-modal__stations">
            <legend>{d.prepareAvailableStations}</legend>
            <div className="prepare-modal__station-grid">
              {available.map((id) => {
                const isSelected = selected.includes(id)
                const isAuto = id.startsWith('R')
                return (
                  <button
                    key={id}
                    type="button"
                    className={`prepare-modal__station${isSelected ? ' prepare-modal__station--selected' : ''}${isAuto ? ' prepare-modal__station--auto' : ' prepare-modal__station--manual'}`}
                    onClick={() => toggle(id)}
                  >
                    {id}
                  </button>
                )
              })}
            </div>
          </fieldset>

          {error && (
            <p className="order-modal__blocked" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="order-modal__actions">
          <button type="button" className="order-btn order-btn--ghost order-btn--large" onClick={onClose}>
            {d.prepareCancel}
          </button>
          <button type="button" className="order-btn order-btn--primary order-btn--large" onClick={handleConfirm}>
            {d.prepareConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}
