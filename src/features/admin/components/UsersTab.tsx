import { useState } from 'react'
import { PlusCircle, User } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AdminUser } from '../../../types/admin'
import type { Company, UserRole } from '../../../types/auth'
import {
  createAdminUser,
  getAdminUsers,
  resetAdminUserPassword,
  toggleAdminUserStatus,
  updateAdminUser,
} from '../../../utils/adminStorage'
import { filterAdminUsers, getAdminUserEmail } from '../../../utils/adminViewHelpers'
import { canEditAdminUser, getAssignableRoles } from '../../../utils/permissions'
import { AdminConfirmModal } from './AdminConfirmModal'
import { AdminDetailModal } from './AdminDetailModal'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminFormModal } from './AdminFormModal'
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

const EMPTY_FORM: UserForm = {
  name: '',
  username: '',
  role: 'user',
  company: 'SUMO',
  status: 'activo',
}

export function UsersTab({ refreshKey, onChanged }: UsersTabProps) {
  const { user: actor } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.admin

  const users = getAdminUsers()
  void refreshKey

  const assignableRoles = actor ? getAssignableRoles(actor) : []

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | 'detail' | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<UserForm>(EMPTY_FORM)
  const [formDirty, setFormDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState<AdminUser | null>(null)
  const [confirmResetPassword, setConfirmResetPassword] = useState<AdminUser | null>(null)

  const filtered = filterAdminUsers(users, search, lang)
  const editingUser = editingId ? users.find((u) => u.id === editingId) : null

  function openCreate() {
    setForm({ ...EMPTY_FORM, role: assignableRoles[0] ?? 'user' })
    setFormDirty(false)
    setEditingId(null)
    setError(null)
    setModal('create')
  }

  function openEdit(u: AdminUser) {
    if (!actor || !canEditAdminUser(actor, u.role)) return
    setForm({
      name: u.name,
      username: u.username,
      role: u.role,
      company: u.company,
      status: u.status,
    })
    setFormDirty(false)
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

    if (modal === 'create') {
      const result = createAdminUser(actor, { ...form })
      if (!result.ok) {
        setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
        return
      }
    } else if (modal === 'edit' && editingId) {
      const result = updateAdminUser(actor, editingId, { ...form })
      if (!result.ok) {
        setError(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
        return
      }
    } else {
      return
    }

    setModal(null)
    setFormDirty(false)
    onChanged()
  }

  function handleToggle(u: AdminUser) {
    if (!actor || !canEditAdminUser(actor, u.role)) return
    if (u.status === 'activo') {
      setConfirmDeactivate(u)
      return
    }
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

  function handleResetPassword(u: AdminUser) {
    if (!actor || !canEditAdminUser(actor, u.role)) return
    setConfirmResetPassword(u)
  }

  function confirmReset() {
    if (!actor || !confirmResetPassword) return
    const result = resetAdminUserPassword(actor, confirmResetPassword.id)
    if (!result.ok) {
      alert(d.errors[result.error as keyof typeof d.errors] ?? d.errors.generic)
      setConfirmResetPassword(null)
      return
    }
    setConfirmResetPassword(null)
    onChanged()
    alert(d.resetPasswordSuccess)
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

      <div className="admin-tab__toolbar">
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder={d.searchUsers}
          resultCount={filtered.length}
        />
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          <PlusCircle size={18} aria-hidden="true" />
          {d.createUser}
        </button>
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <ul className="admin-card-list">
          {filtered.map((u) => {
            const canEdit = actor ? canEditAdminUser(actor, u.role) : false
            return (
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
                    {u.requiresPasswordSetup && (
                      <span className="admin-badge admin-badge--warn">{d.passwordSetupPending}</span>
                    )}
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
                  {canEdit && (
                    <>
                      <button type="button" className="admin-btn" onClick={() => openEdit(u)}>
                        {d.editMock}
                      </button>
                      <button type="button" className="admin-btn" onClick={() => handleResetPassword(u)}>
                        {d.resetPassword}
                      </button>
                      <button type="button" className="admin-btn" onClick={() => handleToggle(u)}>
                        {u.status === 'activo' ? d.deactivate : d.activate}
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <AdminFormModal
          title={modal === 'create' ? d.createUser : d.editUser}
          subtitle={d.formMockSubtitle}
          cancelLabel={d.cancel}
          saveLabel={d.save}
          unsavedChanges={formDirty}
          onClose={() => {
            setModal(null)
            setFormDirty(false)
          }}
          onSave={handleSave}
        >
          <div className="admin-form">
            <div className="admin-form__row">
              <label>{d.colName}</label>
              <input
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value })
                  setFormDirty(true)
                }}
              />
            </div>
            <div className="admin-form__row">
              <label>{d.colUsername}</label>
              <input
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value })
                  setFormDirty(true)
                }}
              />
            </div>
            <div className="admin-form__grid">
              <div className="admin-form__row">
                <label>{d.colRole}</label>
                <select
                  value={form.role}
                  onChange={(e) => {
                    setForm({ ...form, role: e.target.value as UserRole })
                    setFormDirty(true)
                  }}
                >
                  {assignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {t.roles[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form__row">
                <label>{d.colCompany}</label>
                <select
                  value={form.company}
                  onChange={(e) => {
                    setForm({ ...form, company: e.target.value as Company })
                    setFormDirty(true)
                  }}
                >
                  <option value="SUMO">SUMO</option>
                  <option value="MAF">MAF</option>
                  <option value="GLOBAL">GLOBAL</option>
                  <option value="CMSA">CMSA</option>
                </select>
              </div>
            </div>
            <div className="admin-form__row">
              <label>{d.colStatus}</label>
              <select
                value={form.status}
                onChange={(e) => {
                  setForm({ ...form, status: e.target.value as AdminUser['status'] })
                  setFormDirty(true)
                }}
              >
                <option value="activo">{d.statusActive}</option>
                <option value="inactivo">{d.statusInactive}</option>
              </select>
            </div>
            {error && <p className="admin-form__error">{error}</p>}
            {modal === 'create' && (
              <p className="admin-form__note">{d.createUserPasswordHint}</p>
            )}
            {modal === 'edit' && <p className="admin-form__note">{d.inactiveHint}</p>}
          </div>
        </AdminFormModal>
      )}

      {modal === 'detail' && editingUser && (
        <AdminDetailModal title={d.userDetail} closeLabel={d.close} onClose={() => setModal(null)}>
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
              <dt>{d.colPasswordStatus}</dt>
              <dd>
                {editingUser.requiresPasswordSetup ? d.passwordSetupPending : d.passwordSetupDone}
              </dd>
            </div>
            <div className="order-modal__row">
              <dt>{d.lastAccess}</dt>
              <dd>{editingUser.lastAccessMock}</dd>
            </div>
          </dl>
        </AdminDetailModal>
      )}

      {confirmResetPassword && (
        <AdminConfirmModal
          title={d.confirmResetPassword}
          message={d.confirmResetPasswordMsg}
          confirmLabel={d.resetPassword}
          cancelLabel={d.cancel}
          onConfirm={confirmReset}
          onCancel={() => setConfirmResetPassword(null)}
        />
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
