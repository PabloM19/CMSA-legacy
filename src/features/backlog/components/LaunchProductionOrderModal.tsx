import { useMemo, useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DailyOrder } from '../../../types/dailyOrder'
import type { User } from '../../../types/auth'
import { launchProductionOrder } from '../../../utils/dailyOrderOperations'
import {
  formatMockEtc,
  mockOccupancyPercent,
  recommendedStations,
  validateBoxesPerHour,
  validateProductionOrderBoxes,
} from '../../../utils/productionOrderValidation'
import type { BacklogOrder } from '../../../types/backlog'
import { isSupervisor } from '../../../utils/permissions'

interface LaunchProductionOrderModalProps {
  dailyOrders: DailyOrder[]
  daily: DailyOrder
  productionOrders: BacklogOrder[]
  user: User
  onClose: () => void
  onLaunched: (dailyOrders: DailyOrder[], productionOrders: BacklogOrder[]) => void
}

export function LaunchProductionOrderModal({
  dailyOrders,
  daily,
  productionOrders,
  user,
  onClose,
  onLaunched,
}: LaunchProductionOrderModalProps) {
  const { t, lang } = useLanguage()
  const d = t.backlog

  const [boxes, setBoxes] = useState('10000')
  const [boxesPerHour, setBoxesPerHour] = useState('2400')
  const [justification, setJustification] = useState('')
  const [error, setError] = useState<string | null>(null)

  const boxesNum = Number(boxes)
  const rateNum = Number(boxesPerHour)

  const validation = useMemo(() => {
    const boxCheck = validateProductionOrderBoxes(boxesNum, lang)
    const rateCheck = validateBoxesPerHour(rateNum, lang)
    return { boxCheck, rateCheck, warnings: [...boxCheck.warnings, ...rateCheck.warnings] }
  }, [boxesNum, rateNum, lang])

  const exceedsRemaining = boxesNum > daily.cajasRestantes
  const needsJustification = exceedsRemaining && isSupervisor(user)
  const blocked =
    validation.boxCheck.blocked ||
    validation.rateCheck.blocked ||
    (exceedsRemaining && !isSupervisor(user)) ||
    (needsJustification && !justification.trim())

  const preview = useMemo(() => {
    if (!boxesNum || !rateNum) return null
    const { etc, endTime } = formatMockEtc(boxesNum, rateNum)
    return {
      etc,
      endTime,
      stations: recommendedStations(boxesNum),
      occupancy: mockOccupancyPercent(boxesNum),
    }
  }, [boxesNum, rateNum])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (blocked) {
      setError(
        exceedsRemaining && !isSupervisor(user)
          ? d.launchExceedsRemaining
          : d.launchValidationError,
      )
      return
    }
    const result = launchProductionOrder(
      dailyOrders,
      productionOrders,
      daily,
      {
        pedidoDiaId: daily.id,
        boxes: boxesNum,
        boxesPerHour: rateNum,
        supervisorOverride: exceedsRemaining,
        overrideJustification: justification.trim() || undefined,
      },
      user,
    )
    onLaunched(result.dailyOrders, result.productionOrders)
    onClose()
  }

  return (
    <div className="order-modal-overlay" role="presentation" onClick={onClose}>
      <form
        className="order-modal order-modal--neutral launch-order-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <header className="order-modal__head">
          <h2 className="order-modal__title">{d.launchModalTitle}</h2>
          <p className="order-modal__subtitle">
            {daily.estilo} · {daily.referencia}
          </p>
        </header>

        <dl className="order-modal__dl">
          <div className="order-modal__row">
            <dt>{d.colRemaining}</dt>
            <dd>{daily.cajasRestantes.toLocaleString('es-ES')}</dd>
          </div>
        </dl>

        <label className="order-modal__label" htmlFor="launch-boxes">
          {d.launchBoxesLabel}
        </label>
        <input
          id="launch-boxes"
          className="ui-input"
          type="number"
          min={1}
          value={boxes}
          onChange={(e) => setBoxes(e.target.value)}
        />

        <label className="order-modal__label" htmlFor="launch-rate">
          {d.boxesPerHour}
        </label>
        <input
          id="launch-rate"
          className="ui-input"
          type="number"
          min={1}
          value={boxesPerHour}
          onChange={(e) => setBoxesPerHour(e.target.value)}
        />

        {validation.warnings.map((w) => (
          <p key={w} className="launch-order-modal__warn">
            {w}
          </p>
        ))}

        {needsJustification && (
          <>
            <label className="order-modal__label" htmlFor="launch-just">
              {d.launchJustificationLabel}
            </label>
            <textarea
              id="launch-just"
              className="ui-input"
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder={d.launchJustificationPlaceholder}
            />
          </>
        )}

        {preview && (
          <div className="launch-order-modal__preview">
            <p>
              {d.etc}: <strong>{preview.etc}</strong> · {d.endTime}: {preview.endTime}
            </p>
            <p>
              {d.launchStations}: {preview.stations} · {d.launchOccupancy}: {preview.occupancy}%
            </p>
          </div>
        )}

        {error && <p className="launch-order-modal__error">{error}</p>}

        <div className="order-modal__actions">
          <button type="button" className="order-btn order-btn--ghost" onClick={onClose}>
            {d.cancel}
          </button>
          <button type="submit" className="order-btn order-btn--primary" disabled={blocked}>
            {d.launchConfirm}
          </button>
        </div>
      </form>
    </div>
  )
}
