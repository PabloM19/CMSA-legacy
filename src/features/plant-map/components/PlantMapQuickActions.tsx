import { Bell, ClipboardList, Map, PlusCircle, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import { canAccessRoute, isSuperAdmin, isSupervisor } from '../../../utils/permissions'
import type { LucideIcon } from 'lucide-react'

interface QuickAction {
  to: string
  icon: LucideIcon
  label: string
  hint: string
}

export function PlantMapQuickActions() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.plantMap

  if (!user) return null

  const actions: QuickAction[] = []

  if (canAccessRoute(user, '/orders/new')) {
    actions.push({
      to: '/orders/new',
      icon: PlusCircle,
      label: d.quickNewObjective,
      hint: d.quickNewObjectiveHint,
    })
  }

  if (canAccessRoute(user, '/backlog')) {
    actions.push({
      to: '/backlog',
      icon: ClipboardList,
      label: d.quickViewQueue,
      hint: d.quickViewQueueHint,
    })
  }

  if (isSupervisor(user)) {
    actions.push({
      to: '/admin',
      icon: Map,
      label: d.quickNewReference,
      hint: d.quickNewReferenceHint,
    })
    actions.push({
      to: '/alarms',
      icon: Bell,
      label: d.quickViewAlarms,
      hint: d.quickViewAlarmsHint,
    })
  }

  if (isSuperAdmin(user)) {
    actions.push({
      to: '/admin',
      icon: ShieldCheck,
      label: d.quickAdmin,
      hint: d.quickAdminHint,
    })
  }

  if (actions.length === 0) return null

  return (
    <section className="plant-map-quick">
      <h2 className="plant-map-quick__title">{d.quickActionsTitle}</h2>
      <div className="plant-map-quick__grid">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.to + action.label} to={action.to} className="plant-map-quick__btn">
              <span className="plant-map-quick__btn-icon" aria-hidden="true">
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <span className="plant-map-quick__btn-label">{action.label}</span>
              <span className="plant-map-quick__btn-hint">{action.hint}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
