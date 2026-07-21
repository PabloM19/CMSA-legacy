import { Ban } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import {
  formatPalletConfigLabel,
  type BarcodeProductionConflictDetails,
} from '../../../utils/referenceProductionValidation'

interface LaunchBarcodeConflictBlockProps {
  conflict: BarcodeProductionConflictDetails
}

export function LaunchBarcodeConflictBlock({ conflict }: LaunchBarcodeConflictBlockProps) {
  const { t } = useLanguage()
  const d = t.backlog
  const heightsUnit = t.newOrder.heightsUnit

  const activeConfigLabel = formatPalletConfigLabel(
    conflict.activeConfig.tipoPalet,
    conflict.activeConfig.alturas,
    heightsUnit,
  )
  const newConfigLabel = formatPalletConfigLabel(
    conflict.candidateConfig.tipoPalet,
    conflict.candidateConfig.alturas,
    heightsUnit,
  )

  return (
    <section className="launch-order-modal__blocked" role="alert" aria-live="polite">
      <header className="launch-order-modal__blocked-head">
        <Ban size={20} aria-hidden="true" />
        <h3 className="launch-order-modal__blocked-title">{d.launchBlockedTitle}</h3>
      </header>
      <p className="launch-order-modal__blocked-message">{d.launchBlockedMessage}</p>

      <dl className="launch-order-modal__blocked-details">
        <div>
          <dt>{d.launchBlockedActiveReference}</dt>
          <dd>{conflict.activeConfig.referenciaId}</dd>
        </div>
        <div>
          <dt>{d.launchBlockedActiveConfig}</dt>
          <dd>{activeConfigLabel}</dd>
        </div>
        <div>
          <dt>{d.launchBlockedNewConfig}</dt>
          <dd>{newConfigLabel}</dd>
        </div>
        <div>
          <dt>{d.launchBlockedStatus}</dt>
          <dd className="launch-order-modal__blocked-status">{d.launchBlockedStatusValue}</dd>
        </div>
      </dl>
    </section>
  )
}
