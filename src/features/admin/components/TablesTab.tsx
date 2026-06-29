import { useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AdminTableRow } from '../../../types/admin'
import {
  getAdminTables,
  toggleAdminTableActive,
  updateAdminTable,
} from '../../../utils/adminStorage'
import { filterAdminTables } from '../../../utils/adminViewHelpers'
import { getStatusLabel } from '../../../utils/plantMapHelpers'
import { AdminConfirmModal } from './AdminConfirmModal'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminSearchBar } from './AdminSearchBar'

interface TablesTabProps {
  refreshKey: number
  onChanged: () => void
}

export function TablesTab({ refreshKey, onChanged }: TablesTabProps) {
  const { user: actor } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.admin

  const tables = getAdminTables()
  void refreshKey

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'edit' | 'detail' | null>(null)
  const [selected, setSelected] = useState<AdminTableRow | null>(null)
  const [form, setForm] = useState({ capacity: 1000, active: true })
  const [error, setError] = useState<string | null>(null)
  const [confirmToggle, setConfirmToggle] = useState<AdminTableRow | null>(null)

  const filtered = filterAdminTables(tables, search, lang)

  function openEdit(row: AdminTableRow) {
    setSelected(row)
    setForm({ capacity: row.capacity, active: row.active })
    setError(null)
    setModal('edit')
  }

  function openDetail(row: AdminTableRow) {
    setSelected(row)
    setModal('detail')
  }

  function handleSave() {
    if (!actor || !selected) return
    const result = updateAdminTable(actor, selected.id, {
      name: selected.name,
      type: selected.type,
      status: selected.status,
      company: selected.company,
      capacity: form.capacity,
      active: form.active,
    })
    if (!result.ok) {
      setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
      return
    }
    setModal(null)
    onChanged()
  }

  function requestToggle(row: AdminTableRow) {
    setConfirmToggle(row)
  }

  function confirmToggleAction() {
    if (!actor || !confirmToggle) return
    toggleAdminTableActive(actor, confirmToggle.id)
    setConfirmToggle(null)
    onChanged()
  }

  return (
    <section className="admin-section dash-card">
      <div className="admin-section__intro">
        <div className="admin-section__icon" aria-hidden="true">
          <LayoutGrid size={32} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="admin-section__title">{d.tabs.tables}</h2>
          <p className="admin-section__desc">{d.sectionTablesDesc}</p>
        </div>
      </div>

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder={d.searchTables}
        resultCount={filtered.length}
      />

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
                    {row.active ? d.statusActiveF : d.statusInactiveF}
                  </span>
                </div>
                <div className="admin-card__tags">
                  <span className="admin-badge admin-badge--master">
                    {row.type === 'automatic' ? d.typeAutomatic : d.typeManual}
                  </span>
                  <span className="admin-badge admin-badge--warn">{getStatusLabel(row.status, lang)}</span>
                  {row.company && (
                    <span className={`admin-badge admin-badge--${row.company.toLowerCase()}`}>
                      {row.company}
                    </span>
                  )}
                </div>
                {row.orderReference && (
                  <p className="admin-card__meta">
                    {d.colOrder}: {row.orderReference}
                  </p>
                )}
              </div>
              <div className="admin-card__actions">
                <button type="button" className="admin-btn" onClick={() => openDetail(row)}>
                  {d.viewDetail}
                </button>
                <button type="button" className="admin-btn" onClick={() => openEdit(row)}>
                  {d.editMock}
                </button>
                <button type="button" className="admin-btn" onClick={() => requestToggle(row)}>
                  {row.active ? d.deactivate : d.activate}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal === 'edit' && selected && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="order-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="order-modal__title">{d.editTable}</h2>
            <div className="admin-form">
              <div className="admin-form__row">
                <label>{d.colCapacity}</label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                />
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
              <p className="admin-form__note">{d.confirmToggleTableMsg}</p>
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

      {modal === 'detail' && selected && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="order-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="order-modal__title">{d.tableDetail}</h2>
            <dl className="order-modal__dl">
              <div className="order-modal__row">
                <dt>{d.colCode}</dt>
                <dd>{selected.name}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colType}</dt>
                <dd>{selected.type === 'automatic' ? d.typeAutomatic : d.typeManual}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colTableStatus}</dt>
                <dd>{getStatusLabel(selected.status, lang)}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colCompany}</dt>
                <dd>{selected.company ?? '—'}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colOrder}</dt>
                <dd>{selected.orderReference ?? '—'}</dd>
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
            <div className="admin-modal__foot">
              <button type="button" className="admin-btn admin-btn--primary" onClick={() => setModal(null)}>
                {d.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmToggle && (
        <AdminConfirmModal
          title={d.confirmToggleTable}
          message={d.confirmToggleTableMsg}
          confirmLabel={confirmToggle.active ? d.deactivate : d.activate}
          cancelLabel={d.cancel}
          onConfirm={confirmToggleAction}
          onCancel={() => setConfirmToggle(null)}
        />
      )}
    </section>
  )
}
