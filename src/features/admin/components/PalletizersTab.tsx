import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AdminPalletizerRow } from '../../../types/admin'
import type { PlantPalletizerStatus } from '../../../types/plant'
import {
  createAdminPalletizer,
  getAdminPalletizers,
  markPalletizerConflict,
  resolvePalletizerConflict,
  toggleAdminPalletizerActive,
  updateAdminPalletizer,
} from '../../../utils/adminStorage'
import { getStatusLabel } from '../../../utils/plantMapHelpers'
import { AdminConfirmModal } from './AdminConfirmModal'

interface PalletizersTabProps {
  refreshKey: number
  onChanged: () => void
}

const STATUSES: PlantPalletizerStatus[] = [
  'free',
  'active',
  'idle',
  'waiting',
  'blocked',
  'conflict',
]

export function PalletizersTab({ refreshKey, onChanged }: PalletizersTabProps) {
  const { user: actor } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.admin

  const rows = getAdminPalletizers()
  void refreshKey

  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    status: 'idle' as PlantPalletizerStatus,
    capacity: 500,
    alert: '',
    active: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [confirmConflict, setConfirmConflict] = useState<AdminPalletizerRow | null>(null)

  function openCreate() {
    setForm({ name: '', status: 'idle', capacity: 500, alert: '', active: true })
    setEditingId(null)
    setModal('create')
  }

  function openEdit(row: AdminPalletizerRow) {
    setForm({
      name: row.name,
      status: row.status,
      capacity: row.capacity,
      alert: row.alert ?? '',
      active: row.active,
    })
    setEditingId(row.id)
    setModal('edit')
    setError(null)
  }

  function handleSave() {
    if (!actor) return
    const payload = {
      name: form.name,
      status: form.status,
      capacity: form.capacity,
      alert: form.alert.trim() || null,
      active: form.active,
    }

    const result =
      modal === 'create'
        ? createAdminPalletizer(actor, payload)
        : editingId
          ? updateAdminPalletizer(actor, editingId, payload)
          : { ok: false as const, error: 'generic' }

    if (!result.ok) {
      setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
      return
    }

    setModal(null)
    onChanged()
  }

  return (
    <section className="admin-panel dash-card">
      <div className="admin-panel__head">
        <h2 className="admin-panel__title">{d.tabs.palletizers}</h2>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          {d.createPalletizer}
        </button>
      </div>
      <p className="admin-panel__hint">{d.palletizerHint}</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{d.colName}</th>
              <th>{d.colTableStatus}</th>
              <th>{d.colCapacity}</th>
              <th>{d.colAlert}</th>
              <th>{d.colActive}</th>
              <th>{d.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.name}</strong></td>
                <td>{getStatusLabel(row.status, lang)}</td>
                <td>{row.capacity}</td>
                <td>{row.alert ?? '—'}</td>
                <td>
                  <span className={`admin-badge admin-badge--${row.active ? 'ok' : 'off'}`}>
                    {row.active ? d.yes : d.no}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="admin-btn" onClick={() => openEdit(row)}>{d.edit}</button>
                    <button type="button" className="admin-btn" onClick={() => { if (actor) { toggleAdminPalletizerActive(actor, row.id); onChanged() } }}>
                      {row.active ? d.deactivate : d.activate}
                    </button>
                    <button type="button" className="admin-btn admin-btn--danger" onClick={() => setConfirmConflict(row)}>
                      {d.markConflict}
                    </button>
                    {row.status === 'conflict' && (
                      <button type="button" className="admin-btn" onClick={() => { if (actor) { resolvePalletizerConflict(actor, row.id); onChanged() } }}>
                        {d.resolveConflict}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="order-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="order-modal__title">{modal === 'create' ? d.createPalletizer : d.editPalletizer}</h2>
            <div className="admin-form">
              <div className="admin-form__row">
                <label>{d.colName}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="admin-form__grid">
                <div className="admin-form__row">
                  <label>{d.colTableStatus}</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PlantPalletizerStatus })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{getStatusLabel(s, lang)}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form__row">
                  <label>{d.colCapacity}</label>
                  <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
                </div>
              </div>
              <div className="admin-form__row">
                <label>{d.colAlert}</label>
                <input value={form.alert} onChange={(e) => setForm({ ...form, alert: e.target.value })} />
              </div>
              <label className="admin-form__check">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                {d.colActive}
              </label>
              {error && <p className="admin-form__error">{error}</p>}
            </div>
            <div className="admin-modal__foot">
              <button type="button" className="admin-btn" onClick={() => setModal(null)}>{d.cancel}</button>
              <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave}>{d.save}</button>
            </div>
          </div>
        </div>
      )}

      {confirmConflict && (
        <AdminConfirmModal
          title={d.confirmMarkConflict}
          message={d.palletizerHint}
          confirmLabel={d.confirm}
          cancelLabel={d.cancel}
          destructive
          onConfirm={() => {
            if (actor) markPalletizerConflict(actor, confirmConflict.id)
            setConfirmConflict(null)
            onChanged()
          }}
          onCancel={() => setConfirmConflict(null)}
        />
      )}
    </section>
  )
}
