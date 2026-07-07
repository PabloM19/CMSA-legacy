import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { useLanguage } from '../../i18n/LanguageContext'
import { getValidSession } from '../../utils/auth'
import {
  getLastActivityAt,
  hasSessionBlockers,
  INACTIVITY_LOGOUT_MS,
  INACTIVITY_WARN_MS,
  resetSessionActivityClock,
  touchSessionActivity,
  touchSessionInput,
} from '../../utils/sessionGuard'
import { useAuth } from './AuthContext'

const EXPIRY_CHECK_MS = 60_000
const IDLE_TICK_MS = 15_000

export function SessionGuard() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const copy = t.session

  const [showInactivityWarning, setShowInactivityWarning] = useState(false)
  const warningShownAtRef = useRef<number | null>(null)
  const showWarningRef = useRef(false)

  useEffect(() => {
    showWarningRef.current = showInactivityWarning
  }, [showInactivityWarning])

  const forceLogout = useCallback(
    (reason: 'expired' | 'inactivity') => {
      setShowInactivityWarning(false)
      warningShownAtRef.current = null
      showWarningRef.current = false
      logout()
      navigate(`/login${reason === 'expired' ? '?expired=1' : '?inactive=1'}`, { replace: true })
    },
    [logout, navigate],
  )

  const handleContinueSession = useCallback(() => {
    resetSessionActivityClock()
    touchSessionActivity()
    setShowInactivityWarning(false)
    warningShownAtRef.current = null
    showWarningRef.current = false
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setShowInactivityWarning(false)
      warningShownAtRef.current = null
      showWarningRef.current = false
      return
    }

    resetSessionActivityClock()

    function dismissWarning() {
      if (showWarningRef.current) {
        setShowInactivityWarning(false)
        warningShownAtRef.current = null
        showWarningRef.current = false
      }
    }

    function onActivity() {
      touchSessionActivity()
      if (hasSessionBlockers()) dismissWarning()
    }

    function onInput() {
      touchSessionInput()
      dismissWarning()
    }

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const
    activityEvents.forEach((event) => window.addEventListener(event, onActivity, { passive: true }))
    document.addEventListener('input', onInput, true)
    document.addEventListener('focusin', onInput, true)

    const expiryTimer = window.setInterval(() => {
      if (!getValidSession()) {
        forceLogout('expired')
      }
    }, EXPIRY_CHECK_MS)

    const idleTimer = window.setInterval(() => {
      if (!getValidSession()) {
        forceLogout('expired')
        return
      }

      if (hasSessionBlockers({ includeModal: !showWarningRef.current })) {
        if (!showWarningRef.current) dismissWarning()
        touchSessionActivity()
        return
      }

      const idleFor = Date.now() - getLastActivityAt()

      if (showWarningRef.current && warningShownAtRef.current != null) {
        if (Date.now() - warningShownAtRef.current >= INACTIVITY_LOGOUT_MS) {
          forceLogout('inactivity')
        }
        return
      }

      if (idleFor >= INACTIVITY_WARN_MS) {
        setShowInactivityWarning(true)
        warningShownAtRef.current = Date.now()
        showWarningRef.current = true
      }
    }, IDLE_TICK_MS)

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, onActivity))
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('focusin', onInput, true)
      window.clearInterval(expiryTimer)
      window.clearInterval(idleTimer)
    }
  }, [forceLogout, isAuthenticated, user])

  if (!showInactivityWarning) return null

  return (
    <ConfirmModal
      className="session-inactivity-modal"
      title={copy.inactivityTitle}
      description={copy.inactivityMessage}
      confirmLabel={copy.continueSession}
      cancelLabel={copy.logoutNow}
      onConfirm={handleContinueSession}
      onCancel={() => forceLogout('inactivity')}
    />
  )
}
