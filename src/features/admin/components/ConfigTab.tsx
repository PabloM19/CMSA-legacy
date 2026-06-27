import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { ProductionConfig } from '../../../types/admin'
import {
  getProductionConfig,
  resetProductionConfig,
  saveProductionConfig,
} from '../../../utils/adminStorage'
import { AdminConfirmModal } from './AdminConfirmModal'

interface ConfigTabProps {
  refreshKey: number
  onChanged: () => void
}

export function ConfigTab({ refreshKey, onChanged }: ConfigTabProps) {
  const { user: actor } = useAuth()
  const { t } = useLanguage()
  const d = t.admin

  void refreshKey
  const [config, setConfig] = useState<ProductionConfig>(() => getProductionConfig())
  const [error, setError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!actor) return
    const result = saveProductionConfig(actor, config)
    if (!result.ok) {
      setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
      return
    }
    setError(null)
    setSaved(true)
    onChanged()
    window.setTimeout(() => setSaved(false), 2500)
  }

  function handleReset() {
    if (!actor) return
    setConfig(resetProductionConfig(actor))
    setConfirmReset(false)
    onChanged()
  }

  return (
    <section className="admin-panel dash-card">
      <div className="admin-panel__head">
        <h2 className="admin-panel__title">{d.tabs.config}</h2>
      </div>
      <p className="admin-panel__hint">{d.configWarning}</p>

      <div className="admin-config-grid">
        <div className="admin-form__row">
          <label>{d.configMinSpeed}</label>
          <input type="number" min={1} value={config.minBoxesPerHour} onChange={(e) => setConfig({ ...config, minBoxesPerHour: Number(e.target.value) })} />
        </div>
        <div className="admin-form__row">
          <label>{d.configMaxSpeed}</label>
          <input type="number" min={1} value={config.maxBoxesPerHour} onChange={(e) => setConfig({ ...config, maxBoxesPerHour: Number(e.target.value) })} />
        </div>
        <div className="admin-form__row">
          <label>{d.configBoxesPerLayer}</label>
          <input type="number" min={1} value={config.boxesPerLayer} onChange={(e) => setConfig({ ...config, boxesPerLayer: Number(e.target.value) })} />
        </div>
        <div className="admin-form__row">
          <label>{d.configLayersPerPallet}</label>
          <input type="number" min={1} value={config.layersPerPallet} onChange={(e) => setConfig({ ...config, layersPerPallet: Number(e.target.value) })} />
        </div>
        <div className="admin-form__row">
          <label>{d.configOverload}</label>
          <input type="number" min={1} value={config.overloadThreshold} onChange={(e) => setConfig({ ...config, overloadThreshold: Number(e.target.value) })} />
        </div>
        <div className="admin-form__row">
          <label>{d.configFinishingSoon}</label>
          <input type="number" min={1} value={config.finishingSoonMinutes} onChange={(e) => setConfig({ ...config, finishingSoonMinutes: Number(e.target.value) })} />
        </div>
        <div className="admin-form__row">
          <label>{d.configSumoCapacity}</label>
          <input type="number" min={0} max={100} value={config.sumoCapacity} onChange={(e) => setConfig({ ...config, sumoCapacity: Number(e.target.value) })} />
        </div>
        <div className="admin-form__row">
          <label>{d.configMafCapacity}</label>
          <input type="number" min={0} max={100} value={config.mafCapacity} onChange={(e) => setConfig({ ...config, mafCapacity: Number(e.target.value) })} />
        </div>
      </div>

      <label className="admin-form__check" style={{ marginTop: 'var(--space-md)' }}>
        <input
          type="checkbox"
          checked={config.allowManualTables}
          onChange={(e) => setConfig({ ...config, allowManualTables: e.target.checked })}
        />
        {d.configAllowManual}
      </label>

      {error && <p className="admin-form__error" style={{ marginTop: 'var(--space-sm)' }}>{error}</p>}
      {saved && <p className="admin-badge admin-badge--ok" style={{ marginTop: 'var(--space-sm)' }}>{d.configSaved}</p>}

      <div className="admin-modal__foot" style={{ borderTop: 'none', paddingTop: 'var(--space-lg)' }}>
        <button type="button" className="admin-btn" onClick={() => setConfirmReset(true)}>{d.configReset}</button>
        <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave}>{d.configSave}</button>
      </div>

      {confirmReset && (
        <AdminConfirmModal
          title={d.confirmResetConfig}
          message={d.configWarning}
          confirmLabel={d.configReset}
          cancelLabel={d.cancel}
          destructive
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </section>
  )
}
