import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings, UserRound } from 'lucide-react'
import type { User } from '../../types/auth'
import { useLanguage } from '../../i18n/LanguageContext'
import './UserMenu.css'

interface UserMenuProps {
  user: User
  onLogout: () => void
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`user-menu__chevron${open ? ' user-menu__chevron--open' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function getChipClass(company: User['company']): string {
  return `user-menu__chip user-menu__chip--${company.toLowerCase()}`
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function goToProfile(hash?: string) {
    setOpen(false)
    navigate(hash ? `/profile${hash}` : '/profile')
  }

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        type="button"
        className={`user-menu__trigger${open ? ' user-menu__trigger--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${user.name}, ${user.company}`}
      >
        <span className="user-menu__icon">
          <UserIcon />
        </span>
        <span className={getChipClass(user.company)}>{user.company}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="user-menu__panel" role="menu">
          <div className="user-menu__panel-header">
            <span className="user-menu__icon user-menu__icon--panel">
              <UserIcon />
            </span>
            <div className="user-menu__profile">
              <span className="user-menu__name">{user.name}</span>
              <span className="user-menu__meta">
                <span className={getChipClass(user.company)}>{user.company}</span>
                <span className="user-menu__role">{t.roles[user.role]}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="user-menu__item"
            role="menuitem"
            onClick={() => goToProfile()}
          >
            <UserRound size={16} aria-hidden="true" />
            {t.profile.viewProfile}
          </button>
          <button
            type="button"
            className="user-menu__item"
            role="menuitem"
            onClick={() => goToProfile('#preferences')}
          >
            <Settings size={16} aria-hidden="true" />
            {t.profile.preferences}
          </button>
          <button
            type="button"
            className="user-menu__item user-menu__item--logout"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            {t.common.logout}
          </button>
        </div>
      )}
    </div>
  )
}
