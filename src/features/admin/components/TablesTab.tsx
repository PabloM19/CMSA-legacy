import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AdminTableRow } from '../../../types/admin'
import type { OrderCompany } from '../../../types/newOrder'
import type { PlantTableStatus, PlantTableType } from '../../../types/plant'
import {
  blockAdminTable,
  createAdminTable,
  getAdminTables,
  releaseAdminTable,
  toggleAdminTableActive,
  updateAdminTable,
} from '../../../utils/adminStorage'
import { getStatusLabel } from '../../../utils/plantMapHelpers'
import { AdminConfirmModal } from './AdminConfirmModal'

interface TablesTabProps {
  refreshKey: number
  onChanged: () => void
}

type TableForm = {
  name: string
  type: PlantTableType
  status: PlantTableStatus
  company: OrderCompany | ''
  capacity: number
  active: boolean
}

const STATUSES: PlantTableStatus[] = [
  'free',
  'reserved',
  'pending_validation',
  'validated',
  'occupied',
  'waiting',
  'blocked',
  'conflict',
]

export function TablesTab({ refreshKey, onChanged }: TablesTabProps) {
  const { user: actor } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.admin

  const tables = getAdminTables()
  void refreshKey

  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TableForm>({
    name: '',
    type: 'automatic',
    status: 'free',
    company: '',
    capacity: 1000,
    active: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<
    { type: 'block' | 'release'; table: AdminTableRow } | null
  >(null)

  function openCreate() {
    setForm({ name: '', type: 'automatic', status: 'free', company: '', capacity: 1000, active: true })
    setEditingId(null)
    setModal('create')
    setError(null)
  }

  function openEdit(row: AdminTableRow) {
    setForm({
      name: row.name,
      type: row.type,
      status: row.status,
      company: row.company ?? '',
      capacity: row.capacity,
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
      type: form.type,
      status: form.status,
      company: form.company || null,
      capacity: form.capacity,
      active: form.active,
    }

    const result =
      modal === 'create'
        ? createAdminTable(actor, payload)
        : editingId
          ? updateAdminTable(actor, editingId, payload)
          : { ok: false as const, error: 'generic' }

    if (!result.ok) {
      setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
      return
    }

    setModal(null)
    onChanged()
  }

  function runConfirmAction() {
    if (!actor || !confirm) return
    if (confirm.type === 'block') blockAdminTable(actor, confirm.table.id)
    else releaseAdminTable(actor, confirm.table.id)
    setConfirm(null)
    onChanged()
  }

  return (
    <section className="admin-panel dash-card">
      <div className="admin-panel__head">
        <h2 className="admin-panel__title">{d.tabs.tables}</h2>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          {d.createTable}
        </button>
      </div>
      <p className="admin-panel__hint">{d.tablesHint}</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{d.colName}</th>
              <th>{d.colType}</th>
              <th>{d.colTableStatus}</th>
              <th>{d.colCompany}</th>
              <th>{d.colOrder}</th>
              <th>{d.colActive}</th>
              <th>{d.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.name}</strong></td>
                <td>{row.type === 'automatic' ? d.typeAutomatic : d.typeManual}</td>
                <td>{getStatusLabel(row.status, lang)}</td>
                <td>{row.company ?? '—'}</td>
                <td>{row.orderReference ?? '—'}</td>
                <td>
                  <span className={`admin-badge admin-badge--${row.active ? 'ok' : 'off'}`}>
                    {row.active ? d.yes : d.no}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="admin-btn" onClick={() => openEdit(row)}>{d.edit}</button>
                    <button type="button" className="admin-btn" onClick={() => { if (actor) { toggleAdminTableActive(actor, row.id); onChanged() } }}>
                      {row.active ? d.deactivate : d.activate}
                    </button>
                    <button type="button" className="admin-btn admin-btn--danger" onClick={() => setConfirm({ type: 'block', table: row })}>
                      {d.blockTable}
                    </button>
                    <button
                      type="button"
                      className="admin-btn"
                      disabled={!row.orderId && row.status === 'free'}
                      onClick={() => setConfirm({ type: 'release', table: row })}
                    >
                      {d.releaseTable}
                    </button>
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
            <h2 className="order-modal__title">{modal === 'create' ? d.createTable : d.editTable}</h2>
            <div className="admin-form">
              <div className="admin-form__row">
                <label>{d.colName}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="admin-form__grid">
                <div className="admin-form__row">
                  <label>{d.colType}</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PlantTableType })}>
                    <option value="automatic">{d.typeAutomatic}</option>
                    <option value="manual">{d.typeManual}</option>
                  </select>
                </div>
                <div className="admin-form__row">
                  <label>{d.colTableStatus}</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PlantTableStatus })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{getStatusLabel(s, lang)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-form__grid">
                <div className="admin-form__row">
                  <label>{d.colCompany}</label>
                  <select value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value as OrderCompany | '' })}>
                    <option value="">—</option>
                    <option value="SUMO">SUMO</option>
                    <option value="MAF">MAF</option>
                  </select>
                </div>
                <div className="admin-form__row">
                  <label>{d.colCapacity}</label>
                  <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
                </div>
              </div>
              <label className="admin-form__check">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                {d.colActive}
              </label>
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

      {confirm && (
        <AdminConfirmModal
          title={confirm.type === 'block' ? d.confirmBlockTable : d.confirmReleaseTable}
          message={
            confirm.type === 'release' && confirm.table.orderId
              ? d.releaseTableMsg
              : d.auditNote
          }
          confirmLabel={d.confirm}
          cancelLabel={d.cancel}
          destructive={confirm.type === 'block'}
          onConfirm={runConfirmAction}
          onCancel={() => setConfirm(null)}
        />
      )}
    </section>
  )
}
