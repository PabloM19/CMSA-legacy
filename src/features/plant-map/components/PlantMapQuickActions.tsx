import { Bell, ClipboardList, Factory, Map, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import { canAccessRoute, isSuperAdmin, isSupervisor } from '../../../utils/permissions'
import type { LucideIcon } from 'lucide-react'

interface QuickAction {
  to?: string
  icon: LucideIcon
  label: string
  hint: string
  onClick?: () => void
  disabled?: boolean
}

interface PlantMapQuickActionsProps {
  onSimulateSafetyAlarm?: () => void
  safetyBlocked?: boolean
}

export function PlantMapQuickActions({
  onSimulateSafetyAlarm,
  safetyBlocked = false,
}: PlantMapQuickActionsProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.plantMap

  if (!user) return null

  const actions: QuickAction[] = []

  if (canAccessRoute(user, '/daily-orders')) {
    actions.push({
      to: '/daily-orders',
      icon: ClipboardList,
      label: d.quickViewQueue,
      hint: d.quickViewQueueHint,
      disabled: safetyBlocked,
    })
  }

  if (canAccessRoute(user, '/production-orders')) {
    actions.push({
      to: '/production-orders',
      icon: Factory,
      label: d.quickProductionOrders,
      hint: d.quickProductionOrdersHint,
      disabled: safetyBlocked,
    })
  }

  if (isSupervisor(user)) {
    actions.push({
      to: '/admin',
      icon: Map,
      label: d.quickNewReference,
      hint: d.quickNewReferenceHint,
      disabled: safetyBlocked,
    })
    actions.push({
      to: '/alarms',
      icon: Bell,
      label: d.quickViewEvents,
      hint: d.quickViewEventsHint,
      disabled: safetyBlocked,
    })
    if (onSimulateSafetyAlarm) {
      actions.push({
        icon: ShieldAlert,
        label: d.simulateSafetyAlarm,
        hint: d.simulateSafetyAlarmHint,
        onClick: onSimulateSafetyAlarm,
        disabled: safetyBlocked,
      })
    }
  }

  if (isSuperAdmin(user)) {
    actions.push({
      to: '/admin',
      icon: ShieldCheck,
      label: d.quickAdmin,
      hint: d.quickAdminHint,
      disabled: safetyBlocked,
    })
  }

  if (actions.length === 0) return null

  return (
    <section className="dash-quick plant-map-quick">
      <h2 className="dash-quick__title">{d.quickActionsTitle}</h2>
      <div className="dash-quick__grid">
        {actions.map((action) => {
          const Icon = action.icon
          const content = (
            <>
              <span className="dash-quick__btn-icon" aria-hidden="true">
                <Icon size={24} strokeWidth={1.75} />
              </span>
              <span className="dash-quick__btn-label">{action.label}</span>
              <span className="dash-quick__btn-hint">{action.hint}</span>
            </>
          )

          if (action.onClick) {
            return (
              <button
                key={action.label}
                type="button"
                className="dash-quick__btn"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {content}
              </button>
            )
          }

          const disabled = action.disabled

          return (
            <Link
              key={action.to! + action.label}
              to={action.to!}
              className={`dash-quick__btn${disabled ? ' dash-quick__btn--disabled' : ''}`}
              aria-disabled={disabled}
              onClick={(e) => {
                if (disabled) e.preventDefault()
              }}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
