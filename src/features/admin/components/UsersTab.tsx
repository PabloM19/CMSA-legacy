import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AdminUser } from '../../../types/admin'
import type { Company, UserRole } from '../../../types/auth'
import {
  createAdminUser,
  getAdminUsers,
  toggleAdminUserStatus,
  updateAdminUser,
} from '../../../utils/adminStorage'
import { AdminConfirmModal } from './AdminConfirmModal'

interface UsersTabProps {
  refreshKey: number
  onChanged: () => void
}

type UserForm = {
  name: string
  username: string
  role: UserRole
  company: Company
  status: AdminUser['status']
}

const emptyForm = (): UserForm => ({
  name: '',
  username: '',
  role: 'user',
  company: 'SUMO',
  status: 'activo',
})

export function UsersTab({ refreshKey, onChanged }: UsersTabProps) {
  const { user: actor } = useAuth()
  const { t } = useLanguage()
  const d = t.admin

  const users = getAdminUsers()
  void refreshKey

  const [modal, setModal] = useState<'create' | 'edit' | 'detail' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm())
  const [error, setError] = useState<string | null>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState<AdminUser | null>(null)

  const editingUser = editingId ? users.find((u) => u.id === editingId) : null

  function openCreate() {
    setForm(emptyForm())
    setError(null)
    setEditingId(null)
    setModal('create')
  }

  function openEdit(u: AdminUser) {
    setForm({
      name: u.name,
      username: u.username,
      role: u.role,
      company: u.company,
      status: u.status,
    })
    setEditingId(u.id)
    setError(null)
    setModal('edit')
  }

  function openDetail(u: AdminUser) {
    setEditingId(u.id)
    setModal('detail')
  }

  function handleSave() {
    if (!actor) return
    const payload = { ...form }

    if (modal === 'create') {
      const result = createAdminUser(actor, payload)
      if (!result.ok) {
        setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
        return
      }
    } else if (modal === 'edit' && editingId) {
      const result = updateAdminUser(actor, editingId, payload)
      if (!result.ok) {
        setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
        return
      }
    }

    setModal(null)
    onChanged()
  }

  function handleToggle(u: AdminUser) {
    if (u.status === 'activo') {
      setConfirmDeactivate(u)
      return
    }
    if (!actor) return
    toggleAdminUserStatus(actor, u.id)
    onChanged()
  }

  function confirmToggle() {
    if (!actor || !confirmDeactivate) return
    const result = toggleAdminUserStatus(actor, confirmDeactivate.id)
    if (!result.ok) {
      alert(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
      setConfirmDeactivate(null)
      return
    }
    setConfirmDeactivate(null)
    onChanged()
  }

  return (
    <section className="admin-panel dash-card">
      <div className="admin-panel__head">
        <h2 className="admin-panel__title">{d.tabs.users}</h2>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          {d.createUser}
        </button>
      </div>
      <p className="admin-panel__hint">{d.inactiveHint}</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{d.colName}</th>
              <th>{d.colUsername}</th>
              <th>{d.colCompany}</th>
              <th>{d.colRole}</th>
              <th>{d.colStatus}</th>
              <th>{d.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.username}</td>
                <td>
                  <span className={`admin-badge admin-badge--${u.company.toLowerCase()}`}>
                    {u.company}
                  </span>
                </td>
                <td>{t.roles[u.role]}</td>
                <td>
                  <span className={`admin-badge admin-badge--${u.status === 'activo' ? 'ok' : 'off'}`}>
                    {u.status === 'activo' ? d.statusActive : d.statusInactive}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="admin-btn" onClick={() => openDetail(u)}>
                      {d.viewDetail}
                    </button>
                    <button type="button" className="admin-btn" onClick={() => openEdit(u)}>
                      {d.edit}
                    </button>
                    <button type="button" className="admin-btn" onClick={() => handleToggle(u)}>
                      {u.status === 'activo' ? d.deactivate : d.activate}
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
              {modal === 'create' ? d.createUser : d.editUser}
            </h2>
            <div className="admin-form">
              <div className="admin-form__row">
                <label>{d.colName}</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="admin-form__row">
                <label>{d.colUsername}</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="admin-form__grid">
                <div className="admin-form__row">
                  <label>{d.colRole}</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  >
                    <option value="user">{t.roles.user}</option>
                    <option value="validator">{t.roles.validator}</option>
                    <option value="master">{t.roles.master}</option>
                  </select>
                </div>
                <div className="admin-form__row">
                  <label>{d.colCompany}</label>
                  <select
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value as Company })}
                  >
                    <option value="SUMO">SUMO</option>
                    <option value="MAF">MAF</option>
                    <option value="CMSA">CMSA</option>
                    <option value="MASTER">MASTER</option>
                  </select>
                </div>
              </div>
              <div className="admin-form__row">
                <label>{d.colStatus}</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as AdminUser['status'] })
                  }
                >
                  <option value="activo">{d.statusActive}</option>
                  <option value="inactivo">{d.statusInactive}</option>
                </select>
              </div>
              {error && <p className="admin-form__error">{error}</p>}
              <p className="admin-form__note">{d.auditNote}</p>
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

      {modal === 'detail' && editingUser && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="order-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="order-modal__title">{d.userDetail}</h2>
            <dl className="order-modal__dl">
              <div className="order-modal__row">
                <dt>{d.colName}</dt>
                <dd>{editingUser.name}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colUsername}</dt>
                <dd>{editingUser.username}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colRole}</dt>
                <dd>{t.roles[editingUser.role]}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colCompany}</dt>
                <dd>{editingUser.company}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.colStatus}</dt>
                <dd>{editingUser.status}</dd>
              </div>
              <div className="order-modal__row">
                <dt>{d.lastAccess}</dt>
                <dd>{editingUser.lastAccessMock}</dd>
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

      {confirmDeactivate && (
        <AdminConfirmModal
          title={d.confirmDeactivateUser}
          message={`${d.inactiveHint} ${d.confirmDeactivateUserMsg.replace('{name}', confirmDeactivate.username)}`}
          confirmLabel={d.deactivate}
          cancelLabel={d.cancel}
          destructive
          onConfirm={confirmToggle}
          onCancel={() => setConfirmDeactivate(null)}
        />
      )}
    </section>
  )
}
