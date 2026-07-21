import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ReferenceAutofillFields,
  ReferenceSelectField,
} from '../../../components/reference/ReferenceSelectField'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { DailyOrder } from '../../../types/dailyOrder'
import type { User } from '../../../types/auth'
import {
  logLaunchBlocked,
  logLaunchCancelled,
  logOrderLaunched,
} from '../../../utils/activityLogActions'
import { launchProductionOrder } from '../../../utils/dailyOrderOperations'
import {
  formatMockEtc,
  mockOccupancyPercent,
  recommendedStationCodes,
  validateBoxesPerHour,
  validateProductionOrderBoxes,
} from '../../../utils/productionOrderValidation'
import { findProductByReference } from '../../../utils/productSearch'
import { getBarcodeProductionConflict } from '../../../utils/referenceProductionValidation'
import type { BacklogOrder } from '../../../types/backlog'
import { isSupervisor } from '../../../utils/permissions'
import { LaunchBarcodeConflictBlock } from './LaunchBarcodeConflictBlock'
import { LaunchOrderSummaryBlock } from './LaunchOrderSummaryBlock'

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
  const page = t.dailyOrdersPage

  const catalogProduct = useMemo(
    () => findProductByReference(daily.referencia) ?? null,
    [daily.referencia],
  )

  const [boxes, setBoxes] = useState(() =>
    daily.cajasRestantes > 0 ? String(daily.cajasRestantes) : '',
  )
  const [boxesPerHour, setBoxesPerHour] = useState('2400')
  const [justification, setJustification] = useState('')
  const [error, setError] = useState<string | null>(null)
  const launchedRef = useRef(false)
  const conflictLoggedRef = useRef(false)

  const boxesNum = Number(boxes)
  const rateNum = Number(boxesPerHour)
  const referenceMissing = !catalogProduct

  const validation = useMemo(() => {
    const boxCheck = validateProductionOrderBoxes(boxesNum, lang)
    const rateCheck = validateBoxesPerHour(rateNum, lang)
    return { boxCheck, rateCheck, warnings: [...boxCheck.warnings, ...rateCheck.warnings] }
  }, [boxesNum, rateNum, lang])

  const barcodeConflict = useMemo(
    () => getBarcodeProductionConflict(daily, productionOrders, catalogProduct),
    [daily, productionOrders, catalogProduct],
  )

  useEffect(() => {
    if (barcodeConflict && !conflictLoggedRef.current) {
      logLaunchBlocked(user)
      conflictLoggedRef.current = true
    }
  }, [barcodeConflict, user])

  const exceedsRemaining = boxesNum > daily.cajasRestantes
  const needsJustification = exceedsRemaining && isSupervisor(user)
  const blocked =
    !boxes.trim() ||
    boxesNum <= 0 ||
    referenceMissing ||
    Boolean(barcodeConflict) ||
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
      stations: recommendedStationCodes(boxesNum),
      occupancy: mockOccupancyPercent(boxesNum),
    }
  }, [boxesNum, rateNum])

  function handleCancel() {
    if (!launchedRef.current) {
      logLaunchCancelled(user, daily.referencia)
    }
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (referenceMissing) {
      setError(page.createReferenceRequired)
      return
    }
    if (barcodeConflict) {
      setError(d.launchBlockedMessage)
      return
    }
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
    if (!result.order) {
      if (!conflictLoggedRef.current) {
        logLaunchBlocked(user)
        conflictLoggedRef.current = true
      }
      setError(d.launchBlockedMessage)
      return
    }
    logOrderLaunched(user, result.order.reference, daily.id)
    launchedRef.current = true
    onLaunched(result.dailyOrders, result.productionOrders)
    onClose()
  }

  return (
    <div className="order-modal-overlay" role="presentation" onClick={handleCancel}>
      <form
        className="order-modal order-modal--neutral launch-order-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <header className="order-modal__head">
          <h2 className="order-modal__title">{d.launchModalTitle}</h2>
          <p className="order-modal__subtitle">{daily.variedad}</p>
        </header>

        <div className="launch-order-modal__reference">
          <ReferenceSelectField
            id="launch-reference-select"
            selectedProductId={catalogProduct?.id ?? null}
            onSelectProduct={() => {}}
            readOnly
            error={referenceMissing ? page.createReferenceRequired : undefined}
          />
          <ReferenceAutofillFields
            product={catalogProduct}
            company={daily.empresa}
            className="reference-autofill--compact"
          />
        </div>

        <dl className="order-modal__dl launch-order-modal__totals">
          <div className="order-modal__row">
            <dt>{d.colTotalDay}</dt>
            <dd>{daily.totalCajasDia.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.colAssigned}</dt>
            <dd>{daily.cajasAsignadas.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')}</dd>
          </div>
          <div className="order-modal__row">
            <dt>{d.colRemaining}</dt>
            <dd>{daily.cajasRestantes.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')}</dd>
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

        {barcodeConflict && <LaunchBarcodeConflictBlock conflict={barcodeConflict} />}

        {preview && !barcodeConflict && (
          <LaunchOrderSummaryBlock
            etc={preview.etc}
            endTime={preview.endTime}
            stations={preview.stations}
            occupancy={preview.occupancy}
          />
        )}

        {error && <p className="launch-order-modal__error">{error}</p>}

        <div className="order-modal__actions">
          <button type="button" className="order-btn order-btn--ghost" onClick={handleCancel}>
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
