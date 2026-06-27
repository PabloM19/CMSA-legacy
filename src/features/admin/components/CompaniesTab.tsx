import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AdminCompany } from '../../../types/admin'
import {
  createAdminCompany,
  getAdminCompanies,
  toggleAdminCompanyStatus,
  updateAdminCompany,
} from '../../../utils/adminStorage'
import { AdminConfirmModal } from './AdminConfirmModal'

interface CompaniesTabProps {
  refreshKey: number
  onChanged: () => void
}

export function CompaniesTab({ refreshKey, onChanged }: CompaniesTabProps) {
  const { user: actor } = useAuth()
  const { t } = useLanguage()
  const d = t.admin

  const companies = getAdminCompanies()
  void refreshKey

  const [modal, setModal] = useState<'edit' | 'create' | 'detail' | null>(null)
  const [selected, setSelected] = useState<AdminCompany | null>(null)
  const [form, setForm] = useState({ name: '', color: '#6D28D9', assignedCapacity: 50 })
  const [error, setError] = useState<string | null>(null)
  const [confirmToggle, setConfirmToggle] = useState<AdminCompany | null>(null)

  function openEdit(c: AdminCompany) {
    setSelected(c)
    setForm({ name: c.name, color: c.color, assignedCapacity: c.assignedCapacity })
    setError(null)
    setModal('edit')
  }

  function openCreate() {
    setSelected(null)
    setForm({ name: '', color: '#6D28D9', assignedCapacity: 50 })
    setModal('create')
  }

  function handleSave() {
    if (!actor) return

    if (modal === 'create') {
      const result = createAdminCompany(actor, form)
      if (!result.ok) {
        setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
        return
      }
    } else if (modal === 'edit' && selected) {
      const result = updateAdminCompany(actor, selected.id, {
        color: form.color,
        assignedCapacity: form.assignedCapacity,
      })
      if (!result.ok) {
        setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
        return
      }
    }

    setModal(null)
    onChanged()
  }

  function handleToggle(c: AdminCompany) {
    if (c.status === 'activa') {
      setConfirmToggle(c)
      return
    }
    if (!actor) return
    toggleAdminCompanyStatus(actor, c.id)
    onChanged()
  }

  return (
    <section className="admin-panel dash-card">
      <div className="admin-panel__head">
        <h2 className="admin-panel__title">{d.tabs.companies}</h2>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          {d.createCompany}
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{d.colName}</th>
              <th>{d.colColor}</th>
              <th>{d.colCapacity}</th>
              <th>{d.colStatus}</th>
              <th>{d.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td>
                  <span className={`admin-badge admin-badge--${c.name.toLowerCase()}`}>
                    {c.name}
                  </span>
                </td>
                <td>
                  <span className="admin-color-swatch" style={{ background: c.color }} />
                  {c.color}
                </td>
                <td>{c.assignedCapacity}%</td>
                <td>
                  <span className={`admin-badge admin-badge--${c.status === 'activa' ? 'ok' : 'off'}`}>
                    {c.status === 'activa' ? d.statusActiveF : d.statusInactiveF}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="admin-btn" onClick={() => { setSelected(c); setModal('detail') }}>
                      {d.viewDetail}
                    </button>
                    <button type="button" className="admin-btn" onClick={() => openEdit(c)}>
                      {d.edit}
                    </button>
                    <button type="button" className="admin-btn" onClick={() => handleToggle(c)}>
                      {c.status === 'activa' ? d.deactivate : d.activate}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && modal !== 'detail' && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="order-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="order-modal__title">
              {modal === 'create' ? d.createCompany : d.editCompany}
            </h2>
            <div className="admin-form">
              {modal === 'create' && (
                <div className="admin-form__row">
                  <label>{d.colName}</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              )}
              <div className="admin-form__row">
                <label>{d.colColor}</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </div>
              <div className="admin-form__row">
                <label>{d.colCapacity} (0–100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.assignedCapacity}
                  onChange={(e) =>
                    setForm({ ...form, assignedCapacity: Number(e.target.value) })
                  }
                />
              </div>
              {error && <p className="admin-form__error">{error}</p>}
              <p className="admin-form__note">{d.auditNote}</p>
            </div>
            <div className="admin-modal__foot">
              <button type="button" className="admin-btn" onClick={() => setModal(null)}>{d.cancel}</button>
              <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave}>{d.save}</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'detail' && selected && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="order-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="order-modal__title">{d.companyDetail}</h2>
            <dl className="order-modal__dl">
              <div className="order-modal__row"><dt>{d.colName}</dt><dd>{selected.name}</dd></div>
              <div className="order-modal__row"><dt>{d.colColor}</dt><dd>{selected.color}</dd></div>
              <div className="order-modal__row"><dt>{d.colCapacity}</dt><dd>{selected.assignedCapacity}%</dd></div>
              <div className="order-modal__row"><dt>{d.colStatus}</dt><dd>{selected.status}</dd></div>
            </dl>
            <div className="admin-modal__foot">
              <button type="button" className="admin-btn admin-btn--primary" onClick={() => setModal(null)}>{d.close}</button>
            </div>
          </div>
        </div>
      )}

      {confirmToggle && (
        <AdminConfirmModal
          title={d.confirmDeactivateCompany}
          message={d.inactiveHint}
          confirmLabel={d.deactivate}
          cancelLabel={d.cancel}
          destructive
          onConfirm={() => {
            if (actor) toggleAdminCompanyStatus(actor, confirmToggle.id)
            setConfirmToggle(null)
            onChanged()
          }}
          onCancel={() => setConfirmToggle(null)}
        />
      )}
    </section>
  )
}
