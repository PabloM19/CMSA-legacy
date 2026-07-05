import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type {
  NewOrderFormData,
  NewOrderFormErrors,
  OrderCalculation,
  OrderCompany,
} from '../../types/newOrder'
import type { User } from '../../types/auth'
import { calculateOrder, hasFormErrors, validateNewOrderForm } from '../../utils/orderCalculation'
import {
  getStepHint,
  validateStep1,
  validateStep2,
  type NewOrderWizardStep,
} from '../../utils/newOrderViewHelpers'
import { generateOrderId, generateOrderReference, saveCreatedOrder } from '../../utils/orderStorage'
import { mergeCreatedOrder } from '../../utils/backlogStorage'
import { logOrderCreated, logReferenceCreated } from '../../utils/activityLogActions'
import { BacklogToast } from '../backlog/components/BacklogToast'
import { isSupervisor } from '../../utils/permissions'
import type { MockProduct } from '../../data/mockProducts'
import { AddReferenceModal } from './components/AddReferenceModal'
import { ConfirmOrderModal } from './components/ConfirmOrderModal'
import { ConfirmOrderFinalModal } from './components/ConfirmOrderFinalModal'
import { NewOrderImpactReview } from './components/NewOrderImpactReview'
import { NewOrderLiveSummary } from './components/NewOrderLiveSummary'
import { NewOrderStep1 } from './components/NewOrderStep1'
import { NewOrderStep2 } from './components/NewOrderStep2'
import { NewOrderStepper } from './components/NewOrderStepper'
import { NewOrderSuccessModal } from './components/NewOrderSuccessModal'
import '../dashboard/dashboard.css'
import './newOrder.css'

const CALC_DELAY_MS = 500

function resolveCompany(user: User): OrderCompany {
  if (user.company === 'SUMO' || user.company === 'MAF') return user.company
  return 'SUMO'
}

function emptyForm(company: OrderCompany): NewOrderFormData {
  return {
    company,
    reference: '',
    productId: '',
    productReference: '',
    productName: '',
    product: '',
    variety: '',
    type: '',
    boxFormat: '',
    boxes: '',
    boxesPerHour: '',
    barcode: '',
  }
}

export function NewOrderPage() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const d = t.newOrder

  const initialCompany = useMemo(
    () => (user ? resolveCompany(user) : 'SUMO'),
    [user],
  )

  const [step, setStep] = useState<NewOrderWizardStep>(1)
  const [form, setForm] = useState<NewOrderFormData>(() => emptyForm(initialCompany))
  const [errors, setErrors] = useState<NewOrderFormErrors>({})
  const [calculating, setCalculating] = useState(false)
  const [calculation, setCalculation] = useState<OrderCalculation | null>(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showFinalModal, setShowFinalModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [acceptedReference, setAcceptedReference] = useState('')
  const [showAddReference, setShowAddReference] = useState(false)
  const [catalogVersion, setCatalogVersion] = useState(0)
  const [stepHint, setStepHint] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null,
  )

  const companyLocked = user?.role === 'user'
  const canAddReference = user ? isSupervisor(user) : false

  function updateField<K extends keyof NewOrderFormData>(key: K, value: NewOrderFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    if (key === 'boxes' || key === 'boxesPerHour') {
      setCalculation(null)
    }
    setStepHint(null)
  }

  function handleSelectProduct(product: MockProduct) {
    setForm((prev) => ({
      ...prev,
      productId: product.id,
      productReference: product.referenciaProducto,
      productName: product.nombre,
      product: product.producto,
      variety: product.variedad,
      type: product.uso,
      boxFormat: product.formatoCaja,
      barcode: product.barcode,
      boxesPerHour:
        product.cajasHoraSugeridas != null
          ? String(product.cajasHoraSugeridas)
          : prev.boxesPerHour,
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.productId
      delete next.product
      delete next.variety
      return next
    })
    setCalculation(null)
    setStepHint(null)
  }

  function handleClearProduct() {
    setForm((prev) => ({
      ...prev,
      productId: '',
      productReference: '',
      productName: '',
      product: '',
      variety: '',
      type: '',
      boxFormat: '',
      barcode: '',
      boxesPerHour: '',
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.productId
      delete next.product
      delete next.variety
      return next
    })
    setCalculation(null)
    setStepHint(null)
  }

  function resetWizard(keepCompany = true) {
    setForm(keepCompany ? emptyForm(form.company) : emptyForm(initialCompany))
    setStep(1)
    setCalculation(null)
    setErrors({})
    setShowSummaryModal(false)
    setShowFinalModal(false)
    setShowSuccessModal(false)
    setAcceptedReference('')
    setStepHint(null)
  }

  function handleContinueStep1() {
    const validation = validateStep1(form, lang)
    setErrors(validation)
    if (hasFormErrors(validation)) {
      setStepHint(getStepHint(1, form, lang))
      return
    }
    setStep(2)
    setStepHint(null)
  }

  async function handleCalculate() {
    if (calculating) return

    const step1Errors = validateStep1(form, lang)
    const step2Errors = validateStep2(form, lang)
    const validation = { ...step1Errors, ...step2Errors }
    setErrors(validation)

    if (hasFormErrors(validation)) {
      setStepHint(getStepHint(2, form, lang))
      return
    }

    const fullValidation = validateNewOrderForm(form, lang)
    if (hasFormErrors(fullValidation)) {
      setErrors(fullValidation)
      return
    }

    const boxes = Number(form.boxes)
    const boxesPerHour = Number(form.boxesPerHour)

    setCalculating(true)
    await new Promise((resolve) => setTimeout(resolve, CALC_DELAY_MS))

    const result = calculateOrder(boxes, boxesPerHour, lang)
    setCalculation(result)
    setCalculating(false)
    setStep(3)
    setStepHint(null)
  }

  function handleBack() {
    setStepHint(null)
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  function handleReviewConfirm() {
    if (!calculation) return
    setShowFinalModal(false)
    setShowSummaryModal(true)
  }

  function handleModify() {
    setShowSummaryModal(false)
    setShowFinalModal(false)
  }

  function handleProceedToFinal() {
    if (!calculation || calculation.blocked) return
    setShowSummaryModal(false)
    setShowFinalModal(true)
  }

  function handleBackToModify() {
    setShowFinalModal(false)
    setShowSummaryModal(true)
  }

  function handleAcceptFinal() {
    if (!calculation || calculation.blocked || !user) return

    const boxes = Number(form.boxes)
    const boxesPerHour = Number(form.boxesPerHour)
    const reference = generateOrderReference()

    const created = {
      ...form,
      reference,
      boxes,
      boxesPerHour,
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
      calculation,
      ...(form.barcode.trim() ? { barcode: form.barcode.trim() } : {}),
      ...(form.productId
        ? {
            productId: form.productId,
            productReference: form.productReference,
            productName: form.productName,
          }
        : {}),
    }

    saveCreatedOrder(created)
    mergeCreatedOrder(created)
    logOrderCreated(user, created.reference, created.company)

    setShowFinalModal(false)
    setShowSummaryModal(false)
    setAcceptedReference(reference)
    setShowSuccessModal(true)
  }

  if (!user) return null

  const boxesNum = Number(form.boxes)
  const rateNum = Number(form.boxesPerHour)
  const hint = stepHint ?? getStepHint(step, form, lang)

  return (
    <div className="new-order">
      <PageHeader
        title={d.title}
        description={d.subtitle}
        showMockBadge
        badgeLabel={d.simulatedBadge}
        extra={
          canAddReference ? (
            <button
              type="button"
              className="ui-btn ui-btn--secondary ui-btn--md new-order__add-ref"
              onClick={() => setShowAddReference(true)}
            >
              <PlusCircle size={18} strokeWidth={1.75} aria-hidden="true" />
              {d.addReferenceBtn}
            </button>
          ) : undefined
        }
      />

      <NewOrderStepper currentStep={step} />

      <div className="new-order-layout">
        <div className="new-order-main">
          {step === 1 && (
            <NewOrderStep1
              key={catalogVersion}
              form={form}
              errors={errors}
              companyLocked={companyLocked}
              onChange={updateField}
              onSelectProduct={handleSelectProduct}
              onClearProduct={handleClearProduct}
            />
          )}
          {step === 2 && (
            <NewOrderStep2 form={form} errors={errors} onChange={updateField} />
          )}
          {step === 3 && calculation && <NewOrderImpactReview calculation={calculation} />}

          {hint && <p className="new-order-step-hint">{hint}</p>}

          {!showSuccessModal && (
            <footer className="new-order-nav">
              {step > 1 && (
                <button type="button" className="order-btn order-btn--ghost" onClick={handleBack}>
                  {d.back}
                </button>
              )}

              {step === 1 && (
                <button type="button" className="order-btn order-btn--primary" onClick={handleContinueStep1}>
                  {d.continue}
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  className="order-btn order-btn--primary"
                  disabled={calculating}
                  onClick={handleCalculate}
                >
                  {calculating ? d.calculating : d.calculateImpact}
                </button>
              )}

              {step === 3 && (
                <button type="button" className="order-btn order-btn--primary" onClick={handleReviewConfirm}>
                  {d.reviewConfirm}
                </button>
              )}
            </footer>
          )}
        </div>

        {!showSuccessModal && <NewOrderLiveSummary form={form} calculation={calculation} />}
      </div>

      {showSummaryModal && calculation && (
        <ConfirmOrderModal
          form={form}
          boxes={boxesNum}
          boxesPerHour={rateNum}
          calculation={calculation}
          onModify={handleModify}
          onAccept={handleProceedToFinal}
        />
      )}

      {showFinalModal && calculation && (
        <ConfirmOrderFinalModal
          form={form}
          calculation={calculation}
          onBackToModify={handleBackToModify}
          onAcceptFinal={handleAcceptFinal}
        />
      )}

      {showSuccessModal && (
        <NewOrderSuccessModal
          reference={acceptedReference}
          onCreateAnother={() => resetWizard(true)}
          onGoToQueue={() => navigate('/production-orders', { replace: true })}
        />
      )}

      {showAddReference && user && (
        <AddReferenceModal
          onClose={() => setShowAddReference(false)}
          onSaved={(product) => {
            setCatalogVersion((v) => v + 1)
            logReferenceCreated(user, product.referenciaProducto)
            setToast({ message: d.addReferenceSuccess, type: 'success' })
          }}
        />
      )}

      <BacklogToast
        message={toast?.message ?? null}
        type={toast?.type}
        onClear={() => setToast(null)}
      />
    </div>
  )
}
