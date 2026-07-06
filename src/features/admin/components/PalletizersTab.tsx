import { useState } from 'react'
import { Package, PlusCircle } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AdminPalletizerRow } from '../../../types/admin'
import type { PlantPalletizerStatus } from '../../../types/plant'
import {
  createAdminPalletizer,
  getAdminPalletizers,
  toggleAdminPalletizerActive,
  updateAdminPalletizer,
} from '../../../utils/adminStorage'
import { filterAdminPalletizers } from '../../../utils/adminViewHelpers'
import { getStatusLabel } from '../../../utils/plantMapHelpers'
import { AdminConfirmModal } from './AdminConfirmModal'
import { AdminDetailModal } from './AdminDetailModal'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminFormModal } from './AdminFormModal'
import { AdminSearchBar } from './AdminSearchBar'

interface PalletizersTabProps {
  refreshKey: number
  onChanged: () => void
}

const STATUSES: PlantPalletizerStatus[] = ['free', 'active', 'idle', 'waiting', 'blocked', 'conflict']

export function PalletizersTab({ refreshKey, onChanged }: PalletizersTabProps) {
  const { user: actor } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.admin

  const rows = getAdminPalletizers()
  void refreshKey

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | 'detail' | null>(null)
  const [selected, setSelected] = useState<AdminPalletizerRow | null>(null)
  const [form, setForm] = useState({
    name: '',
    status: 'idle' as PlantPalletizerStatus,
    capacity: 500,
    alert: '',
    active: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [confirmToggle, setConfirmToggle] = useState<AdminPalletizerRow | null>(null)

  const filtered = filterAdminPalletizers(rows, search, lang)

  function openCreate() {
    setForm({ name: '', status: 'idle', capacity: 500, alert: '', active: true })
    setSelected(null)
    setError(null)
    setModal('create')
  }

  function openEdit(row: AdminPalletizerRow) {
    setSelected(row)
    setForm({
      name: row.name,
      status: row.status,
      capacity: row.capacity,
      alert: row.alert ?? '',
      active: row.active,
    })
    setError(null)
    setModal('edit')
  }

  function openDetail(row: AdminPalletizerRow) {
    setSelected(row)
    setModal('detail')
  }

  function handleSave() {
    if (!actor) return

    if (modal === 'create') {
      const result = createAdminPalletizer(actor, {
        name: form.name,
        capacity: form.capacity,
        active: form.active,
      })
      if (!result.ok) {
        setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
        return
      }
    } else if (modal === 'edit' && selected) {
      const result = updateAdminPalletizer(actor, selected.id, {
        name: selected.name,
        status: form.status,
        capacity: form.capacity,
        alert: form.alert.trim() || null,
        active: form.active,
      })
      if (!result.ok) {
        setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
        return
      }
    } else {
      return
    }
    setModal(null)
    onChanged()
  }

  function confirmToggleAction() {
    if (!actor || !confirmToggle) return
    toggleAdminPalletizerActive(actor, confirmToggle.id)
    setConfirmToggle(null)
    onChanged()
  }

  return (
    <section className="admin-section dash-card">
      <div className="admin-section__intro">
        <div className="admin-section__icon" aria-hidden="true">
          <Package size={32} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="admin-section__title">{d.tabs.palletizers}</h2>
          <p className="admin-section__desc">{d.sectionPalletizersDesc}</p>
        </div>
      </div>

      <div className="admin-tab__toolbar">
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder={d.searchPalletizers}
          resultCount={filtered.length}
        />
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          <PlusCircle size={18} aria-hidden="true" />
          {d.createPalletizer}
        </button>
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <ul className="admin-card-list">
          {filtered.map((row) => (
            <li key={row.id} className="admin-card">
              <div className="admin-card__main">
                <div className="admin-card__head">
                  <strong className="admin-card__title">{row.name}</strong>
                  <span className={`admin-badge admin-badge--${row.active ? 'ok' : 'off'}`}>
                    {row.active ? d.statusActive : d.statusInactive}
                  </span>
                </div>
                <div className="admin-card__tags">
                  <span className="admin-badge admin-badge--warn">{getStatusLabel(row.status, lang)}</span>
                </div>
                {row.alert && <p className="admin-card__alert">{row.alert}</p>}
                <p className="admin-card__hint">{d.palletizerSecondary}</p>
              </div>
              <div className="admin-card__actions">
                <button type="button" className="admin-btn" onClick={() => openDetail(row)}>
                  {d.viewDetail}
                </button>
                <button type="button" className="admin-btn" onClick={() => openEdit(row)}>
                  {d.editMock}
                </button>
                <button type="button" className="admin-btn" onClick={() => setConfirmToggle(row)}>
                  {row.active ? d.deactivate : d.activate}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <AdminFormModal
          title={modal === 'create' ? d.createPalletizer : d.editPalletizer}
          subtitle={d.formMockSubtitle}
          cancelLabel={d.cancel}
          saveLabel={d.save}
          onClose={() => setModal(null)}
          onSave={handleSave}
        >
          <div className="admin-form">
            {modal === 'create' && (
              <div className="admin-form__row">
                <label>{d.colCode}</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="P1"
                />
              </div>
            )}
            <div className="admin-form__grid">
              <div className="admin-form__row">
                <label>{d.colTableStatus}</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as PlantPalletizerStatus })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {getStatusLabel(s, lang)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form__row">
                <label>{d.colCapacity}</label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="admin-form__row">
              <label>{d.colAlert}</label>
              <input value={form.alert} onChange={(e) => setForm({ ...form, alert: e.target.value })} />
            </div>
            <label className="admin-form__check">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              {d.colActive}
            </label>
            {error && <p className="admin-form__error">{error}</p>}
            <p className="admin-form__note">{d.palletizerSecondary}</p>
          </div>
        </AdminFormModal>
      )}

      {modal === 'detail' && selected && (
        <AdminDetailModal title={d.palletizerDetail} closeLabel={d.close} onClose={() => setModal(null)}>
          <dl className="order-modal__dl">
            <div className="order-modal__row">
              <dt>{d.colCode}</dt>
              <dd>{selected.name}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.colTableStatus}</dt>
              <dd>{getStatusLabel(selected.status, lang)}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.colAlert}</dt>
              <dd>{selected.alert ?? '—'}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.colCapacity}</dt>
              <dd>{selected.capacity}</dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.colActive}</dt>
              <dd>{selected.active ? d.yes : d.no}</dd>
            </div>
          </dl>
          <p className="admin-form__note">{d.palletizerSecondary}</p>
        </AdminDetailModal>
      )}

      {confirmToggle && (
        <AdminConfirmModal
          title={d.confirmTogglePalletizer}
          message={d.confirmTogglePalletizerMsg}
          confirmLabel={confirmToggle.active ? d.deactivate : d.activate}
          cancelLabel={d.cancel}
          onConfirm={confirmToggleAction}
          onCancel={() => setConfirmToggle(null)}
        />
      )}
    </section>
  )
}
