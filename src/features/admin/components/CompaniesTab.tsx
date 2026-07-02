import { useMemo, useState } from 'react'
import { Building2, PlusCircle } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AdminCompany } from '../../../types/admin'
import {
  createAdminCompany,
  getAdminCompanies,
  getAdminUsers,
  toggleAdminCompanyStatus,
  updateAdminCompany,
} from '../../../utils/adminStorage'
import { loadBacklogOrders } from '../../../utils/backlogStorage'
import { enrichAdminCompanies, filterAdminCompanies } from '../../../utils/adminViewHelpers'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminSearchBar } from './AdminSearchBar'

interface CompaniesTabProps {
  refreshKey: number
  onChanged: () => void
}

export function CompaniesTab({ refreshKey, onChanged }: CompaniesTabProps) {
  const { user: actor } = useAuth()
  const { t } = useLanguage()
  const d = t.admin

  void refreshKey

  const companies = useMemo(
    () => enrichAdminCompanies(getAdminCompanies(), getAdminUsers(), loadBacklogOrders()),
    [refreshKey],
  )

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | 'detail' | null>(null)
  const [selected, setSelected] = useState<AdminCompany | null>(null)
  const [form, setForm] = useState({ name: '', color: '#6D28D9', assignedCapacity: 50 })
  const [error, setError] = useState<string | null>(null)

  const filtered = filterAdminCompanies(companies, search)
  const selectedEnriched = selected
    ? companies.find((c) => c.id === selected.id) ?? null
    : null

  function openCreate() {
    setForm({ name: '', color: '#6D28D9', assignedCapacity: 50 })
    setSelected(null)
    setError(null)
    setModal('create')
  }

  function openEdit(c: AdminCompany) {
    setSelected(c)
    setForm({ name: c.name, color: c.color, assignedCapacity: c.assignedCapacity })
    setError(null)
    setModal('edit')
  }

  function openDetail(c: AdminCompany) {
    setSelected(c)
    setModal('detail')
  }

  function handleSave() {
    if (!actor) return
    if (modal === 'create') {
      const result = createAdminCompany(actor, {
        name: form.name,
        color: form.color,
        assignedCapacity: form.assignedCapacity,
      })
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
    } else {
      return
    }
    setModal(null)
    onChanged()
  }

  function handleToggle(c: AdminCompany) {
    if (!actor) return
    toggleAdminCompanyStatus(actor, c.id)
    onChanged()
  }

  return (
    <section className="admin-section dash-card">
      <div className="admin-section__intro">
        <div className="admin-section__icon" aria-hidden="true">
          <Building2 size={32} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="admin-section__title">{d.tabs.companies}</h2>
          <p className="admin-section__desc">{d.sectionCompaniesDesc}</p>
        </div>
      </div>

      <div className="admin-tab__toolbar">
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder={d.searchCompanies}
          resultCount={filtered.length}
        />
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          <PlusCircle size={18} aria-hidden="true" />
          {d.createCompany}
        </button>
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <ul className="admin-card-list">
          {filtered.map((c) => (
            <li key={c.id} className="admin-card">
              <div className="admin-card__main">
                <div className="admin-card__head">
                  <strong className="admin-card__title">{c.name}</strong>
                  <span className={`admin-badge admin-badge--${c.status === 'activa' ? 'ok' : 'off'}`}>
                    {c.status === 'activa' ? d.statusActiveF : d.statusInactiveF}
                  </span>
                </div>
                <div className="admin-card__color-row">
                  <span className="admin-color-swatch admin-color-swatch--lg" style={{ background: c.color }} />
                  <span className="admin-card__meta">
                    {d.colCode}: {c.code}
                  </span>
                </div>
                <div className="admin-card__stats">
                  <span className="admin-card__stat">
                    {d.associatedUsers}: <strong>{c.associatedUsers}</strong>
                  </span>
                  <span className="admin-card__stat">
                    {d.activeOrders}: <strong>{c.activeOrders}</strong>
                  </span>
                </div>
              </div>
              <div className="admin-card__actions">
                <button type="button" className="admin-btn" onClick={() => openDetail(c)}>
                  {d.viewDetail}
                </button>
                <button type="button" className="admin-btn" onClick={() => openEdit(c)}>
                  {d.editMock}
                </button>
                <button type="button" className="admin-btn" onClick={() => handleToggle(c)}>
                  {c.status === 'activa' ? d.deactivate : d.activate}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(modal === 'create' || modal === 'edit') && (
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
                    placeholder="SUMO"
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
                  onChange={(e) => setForm({ ...form, assignedCapacity: Number(e.target.value) })}
                />
              </div>
              {error && <p className="admin-form__error">{error}</p>}
              <p className="admin-form__note">{d.inactiveHint}</p>
            </div>
            <div className="admin-modal__foot">
              <button type="button" className="admin-btn" onClick={() => setModal(null)}>
                {d.cancel}
              </button>
              <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave}>
                {d.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'detail' && selectedEnriched && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="order-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="order-modal__title">{d.companyDetail}</h2>
            <dl className="order-modal__dl">
              <div className="order-modal__row">
                <dt>{d.colName}</dt>
                <dd>{selectedEnriched.name}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colCode}</dt>
                <dd>{selectedEnriched.code}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colColor}</dt>
                <dd>
                  <span className="admin-color-swatch" style={{ background: selectedEnriched.color }} />{' '}
                  {selectedEnriched.color}
                </dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.associatedUsers}</dt>
                <dd>{selectedEnriched.associatedUsers}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.activeOrders}</dt>
                <dd>{selectedEnriched.activeOrders}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colStatus}</dt>
                <dd>{selectedEnriched.status === 'activa' ? d.statusActiveF : d.statusInactiveF}</dd>
              </div>
            </dl>
            <div className="admin-modal__foot">
              <button type="button" className="admin-btn admin-btn--primary" onClick={() => setModal(null)}>
                {d.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
