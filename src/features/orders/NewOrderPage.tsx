import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../features/auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import type { NewOrderFormData, NewOrderFormErrors, OrderCompany } from '../../types/newOrder'
import type { User } from '../../types/auth'
import { hasFormErrors } from '../../utils/orderCalculation'
import { getStepHint, validateBeforeConfirm } from '../../utils/newOrderViewHelpers'
import { getState, appendDailyOrderAndSave } from '../../utils/backlogStorage'
import { createDailyOrder } from '../../utils/dailyOrderOperations'
import { logOrderCreated, logReferenceCreated } from '../../utils/activityLogActions'
import { BacklogToast } from '../backlog/components/BacklogToast'
import { isSupervisor } from '../../utils/permissions'
import type { MockProduct } from '../../data/mockProducts'
import { AddReferenceModal } from './components/AddReferenceModal'
import { ConfirmOrderModal } from './components/ConfirmOrderModal'
import { ConfirmOrderFinalModal } from './components/ConfirmOrderFinalModal'
import { NewOrderLiveSummary } from './components/NewOrderLiveSummary'
import { NewOrderStep1 } from './components/NewOrderStep1'
import { NewOrderStepper } from './components/NewOrderStepper'
import { NewOrderSuccessModal } from './components/NewOrderSuccessModal'
import '../dashboard/dashboard.css'
import './newOrder.css'

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

  const [form, setForm] = useState<NewOrderFormData>(() => emptyForm(initialCompany))
  const [errors, setErrors] = useState<NewOrderFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
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
  const confirming = showSummaryModal || showFinalModal

  function updateField<K extends keyof NewOrderFormData>(key: K, value: NewOrderFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
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
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.productId
      delete next.product
      delete next.variety
      return next
    })
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
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.productId
      delete next.product
      delete next.variety
      return next
    })
    setStepHint(null)
  }

  function resetWizard(keepCompany = true) {
    setForm(keepCompany ? emptyForm(form.company) : emptyForm(initialCompany))
    setErrors({})
    setShowSummaryModal(false)
    setShowFinalModal(false)
    setShowSuccessModal(false)
    setAcceptedReference('')
    setStepHint(null)
  }

  function handleReviewConfirm() {
    const validation = validateBeforeConfirm(form, lang)
    setErrors(validation)
    if (hasFormErrors(validation)) {
      setStepHint(getStepHint(form, lang))
      return
    }
    setShowSummaryModal(true)
    setStepHint(null)
  }

  function handleModify() {
    setShowSummaryModal(false)
    setShowFinalModal(false)
  }

  function handleProceedToFinal() {
    setShowSummaryModal(false)
    setShowFinalModal(true)
  }

  function handleBackToModify() {
    setShowFinalModal(false)
    setShowSummaryModal(true)
  }

  async function handleAcceptFinal() {
    if (submitting || !user) return

    const validation = validateBeforeConfirm(form, lang)
    setErrors(validation)
    if (hasFormErrors(validation)) {
      setShowFinalModal(false)
      setShowSummaryModal(false)
      setStepHint(getStepHint(form, lang))
      return
    }

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 400))

    const boxes = Number(form.boxes)
    const state = getState()
    const result = createDailyOrder(
      state.dailyOrders,
      {
        estilo: form.boxFormat.trim() || form.type.trim() || '—',
        referencia: form.productReference.trim(),
        barcode: form.barcode.trim(),
        variedad: form.variety.trim(),
        producto: form.product.trim(),
        empresa: form.company,
        totalCajasDia: boxes,
      },
      user,
    )

    appendDailyOrderAndSave(result.dailyOrders, state.orders, state.plantTables)
    logOrderCreated(user, result.order.referencia, result.order.empresa)

    setShowFinalModal(false)
    setShowSummaryModal(false)
    setAcceptedReference(result.order.referencia)
    setShowSuccessModal(true)
    setSubmitting(false)
    setStepHint(null)
  }

  if (!user) return null

  const hint = stepHint ?? getStepHint(form, lang)

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

      <NewOrderStepper confirming={confirming} />

      <div className="new-order-layout">
        <div className="new-order-main">
          <NewOrderStep1
            key={catalogVersion}
            form={form}
            errors={errors}
            companyLocked={companyLocked}
            onChange={updateField}
            onSelectProduct={handleSelectProduct}
            onClearProduct={handleClearProduct}
          />

          {hint && <p className="new-order-step-hint">{hint}</p>}

          {!showSuccessModal && !confirming && (
            <footer className="new-order-nav">
              <button
                type="button"
                className="order-btn order-btn--primary"
                onClick={handleReviewConfirm}
              >
                {d.reviewConfirm}
              </button>
            </footer>
          )}
        </div>

        {!showSuccessModal && !confirming && <NewOrderLiveSummary form={form} />}
      </div>

      {showSummaryModal && (
        <ConfirmOrderModal
          form={form}
          onModify={handleModify}
          onAccept={handleProceedToFinal}
        />
      )}

      {showFinalModal && (
        <ConfirmOrderFinalModal
          form={form}
          submitting={submitting}
          onBackToModify={handleBackToModify}
          onAcceptFinal={handleAcceptFinal}
        />
      )}

      {showSuccessModal && (
        <NewOrderSuccessModal
          reference={acceptedReference}
          onCreateAnother={() => resetWizard(true)}
          onGoToQueue={() => navigate('/daily-orders', { replace: true })}
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
