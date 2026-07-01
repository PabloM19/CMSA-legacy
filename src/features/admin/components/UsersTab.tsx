import { useState } from 'react'
import { User } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AdminUser } from '../../../types/admin'
import type { Company, UserRole } from '../../../types/auth'
import {
  getAdminUsers,
  toggleAdminUserStatus,
  updateAdminUser,
} from '../../../utils/adminStorage'
import { filterAdminUsers, getAdminUserEmail } from '../../../utils/adminViewHelpers'
import { AdminConfirmModal } from './AdminConfirmModal'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminSearchBar } from './AdminSearchBar'

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

export function UsersTab({ refreshKey, onChanged }: UsersTabProps) {
  const { user: actor } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.admin

  const users = getAdminUsers()
  void refreshKey

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'edit' | 'detail' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<UserForm>({
    name: '',
    username: '',
    role: 'user',
    company: 'SUMO',
    status: 'activo',
  })
  const [error, setError] = useState<string | null>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState<AdminUser | null>(null)

  const filtered = filterAdminUsers(users, search, lang)
  const editingUser = editingId ? users.find((u) => u.id === editingId) : null

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
    if (!actor || !editingId) return
    const result = updateAdminUser(actor, editingId, { ...form })
    if (!result.ok) {
      setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
      return
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
    <section className="admin-section dash-card">
      <div className="admin-section__intro">
        <div className="admin-section__icon" aria-hidden="true">
          <User size={32} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="admin-section__title">{d.tabs.users}</h2>
          <p className="admin-section__desc">{d.sectionUsersDesc}</p>
        </div>
      </div>

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder={d.searchUsers}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <ul className="admin-card-list">
          {filtered.map((u) => (
            <li key={u.id} className="admin-card">
              <div className="admin-card__main">
                <div className="admin-card__head">
                  <strong className="admin-card__title">{u.name}</strong>
                  <span className={`admin-badge admin-badge--${u.status === 'activo' ? 'ok' : 'off'}`}>
                    {u.status === 'activo' ? d.statusActive : d.statusInactive}
                  </span>
                </div>
                <p className="admin-card__meta">{u.username}</p>
                <p className="admin-card__meta">{getAdminUserEmail(u)}</p>
                <div className="admin-card__tags">
                  <span className={`admin-badge admin-badge--${u.company.toLowerCase()}`}>{u.company}</span>
                  <span className="admin-badge admin-badge--master">{t.roles[u.role]}</span>
                </div>
                {u.lastAccessMock && (
                  <p className="admin-card__foot">
                    {d.lastAccess}: {u.lastAccessMock}
                  </p>
                )}
              </div>
              <div className="admin-card__actions">
                <button type="button" className="admin-btn" onClick={() => openDetail(u)}>
                  {d.viewDetail}
                </button>
                <button type="button" className="admin-btn" onClick={() => openEdit(u)}>
                  {d.editMock}
                </button>
                <button type="button" className="admin-btn" onClick={() => handleToggle(u)}>
                  {u.status === 'activo' ? d.deactivate : d.activate}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal === 'edit' && (
        <div className="order-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="order-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="order-modal__title">{d.editUser}</h2>
            <div className="admin-form">
              <div className="admin-form__row">
                <label>{d.colName}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="admin-form__row">
                <label>{d.colUsername}</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="admin-form__grid">
                <div className="admin-form__row">
                  <label>{d.colRole}</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  >
                    <option value="user">{t.roles.user}</option>
                    <option value="supervisor">{t.roles.supervisor}</option>
                    <option value="superadmin">{t.roles.superadmin}</option>
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
                  onChange={(e) => setForm({ ...form, status: e.target.value as AdminUser['status'] })}
                >
                  <option value="activo">{d.statusActive}</option>
                  <option value="inactivo">{d.statusInactive}</option>
                </select>
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
                <dt>{d.colEmail}</dt>
                <dd>{getAdminUserEmail(editingUser)}</dd>
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
                <dd>{editingUser.status === 'activo' ? d.statusActive : d.statusInactive}</dd>
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
