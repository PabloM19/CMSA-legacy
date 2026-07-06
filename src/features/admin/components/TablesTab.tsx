import { useState } from 'react'
import { LayoutGrid, PlusCircle } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AdminTableRow } from '../../../types/admin'
import type { OrderCompany } from '../../../types/newOrder'
import type { PlantTableStatus, PlantTableType } from '../../../types/plant'
import {
  createAdminTable,
  getAdminTables,
  toggleAdminTableActive,
  updateAdminTable,
} from '../../../utils/adminStorage'
import { filterAdminTables } from '../../../utils/adminViewHelpers'
import { getStatusLabel } from '../../../utils/plantMapHelpers'
import { AdminConfirmModal } from './AdminConfirmModal'
import { AdminDetailModal } from './AdminDetailModal'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminFormModal } from './AdminFormModal'
import { AdminSearchBar } from './AdminSearchBar'

interface TablesTabProps {
  refreshKey: number
  onChanged: () => void
}

const TABLE_STATUSES: PlantTableStatus[] = [
  'free',
  'reserved',
  'preparing',
  'pending_validation',
  'validated',
  'occupied',
  'waiting',
  'blocked',
  'conflict',
]

type TableForm = {
  name: string
  type: PlantTableType
  status: PlantTableStatus
  company: OrderCompany | ''
  capacity: number
  active: boolean
}

export function TablesTab({ refreshKey, onChanged }: TablesTabProps) {
  const { user: actor } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.admin

  const tables = getAdminTables()
  void refreshKey

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | 'detail' | null>(null)
  const [selected, setSelected] = useState<AdminTableRow | null>(null)
  const [form, setForm] = useState<TableForm>({
    name: '',
    type: 'automatic',
    status: 'free',
    company: '',
    capacity: 1000,
    active: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [confirmToggle, setConfirmToggle] = useState<AdminTableRow | null>(null)

  const filtered = filterAdminTables(tables, search, lang)

  function openCreate() {
    setForm({
      name: '',
      type: 'automatic',
      status: 'free',
      company: '',
      capacity: 1000,
      active: true,
    })
    setSelected(null)
    setError(null)
    setModal('create')
  }

  function openEdit(row: AdminTableRow) {
    setSelected(row)
    setForm({
      name: row.name,
      type: row.type,
      status: row.status,
      company: row.company ?? '',
      capacity: row.capacity,
      active: row.active,
    })
    setError(null)
    setModal('edit')
  }

  function openDetail(row: AdminTableRow) {
    setSelected(row)
    setModal('detail')
  }

  function handleSave() {
    if (!actor) return
    const company = form.company === '' ? null : form.company

    if (modal === 'create') {
      const result = createAdminTable(actor, {
        name: form.name,
        type: form.type,
        status: form.status,
        company,
        capacity: form.capacity,
        active: form.active,
      })
      if (!result.ok) {
        setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
        return
      }
    } else if (modal === 'edit' && selected) {
      const result = updateAdminTable(actor, selected.id, {
        name: form.name,
        type: form.type,
        status: form.status,
        company,
        capacity: form.capacity,
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

      <div className="admin-tab__toolbar">
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder={d.searchTables}
          resultCount={filtered.length}
        />
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          <PlusCircle size={18} aria-hidden="true" />
          {d.createTable}
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

      {(modal === 'create' || modal === 'edit') && (
        <AdminFormModal
          title={modal === 'create' ? d.createTable : d.editTable}
          subtitle={d.formMockSubtitle}
          cancelLabel={d.cancel}
          saveLabel={d.save}
          onClose={() => setModal(null)}
          onSave={handleSave}
        >
          <div className="admin-form">
            <div className="admin-form__row">
              <label>{d.colCode}</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="R10"
                readOnly={modal === 'edit'}
              />
            </div>
            <div className="admin-form__grid">
              <div className="admin-form__row">
                <label>{d.colType}</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as PlantTableType })}
                >
                  <option value="automatic">{d.typeAutomatic}</option>
                  <option value="manual">{d.typeManual}</option>
                </select>
              </div>
              <div className="admin-form__row">
                <label>{d.colTableStatus}</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as PlantTableStatus })}
                >
                  {TABLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {getStatusLabel(s, lang)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-form__row">
              <label>{d.colCompany}</label>
              <select
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value as OrderCompany | '' })}
              >
                <option value="">—</option>
                <option value="SUMO">SUMO</option>
                <option value="MAF">MAF</option>
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
        </AdminFormModal>
      )}

      {modal === 'detail' && selected && (
        <AdminDetailModal title={d.tableDetail} closeLabel={d.close} onClose={() => setModal(null)}>
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
        </AdminDetailModal>
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
