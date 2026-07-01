import { Map, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { User } from '../../../types/auth'
import { canAccessRoute } from '../../../utils/permissions'

type ActionId = 'newOrder' | 'plantMap' | 'refresh'

interface BacklogQuickActionsProps {
  onRefresh: () => void
}

function isVisible(id: ActionId, user: User): boolean {
  if (id === 'refresh') return true
  if (id === 'newOrder') return canAccessRoute(user, '/orders/new')
  if (id === 'plantMap') return canAccessRoute(user, '/plant-map')
  return false
}

export function BacklogQuickActions({ onRefresh }: BacklogQuickActionsProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.backlog

  if (!user) return null

  const defs = [
    {
      id: 'newOrder' as const,
      to: '/orders/new',
      icon: Plus,
      label: d.actionNewOrder,
      hint: d.actionNewOrderHint,
    },
    {
      id: 'plantMap' as const,
      to: '/plant-map',
      icon: Map,
      label: d.actionPlant,
      hint: d.actionPlantHint,
    },
    {
      id: 'refresh' as const,
      icon: RefreshCw,
      label: d.actionRefresh,
      hint: d.actionRefreshHint,
      onClick: onRefresh,
    },
  ].filter((def) => isVisible(def.id, user))

  return (
    <section className="dash-quick">
      <h2 className="dash-quick__title">{d.quickActionsTitle}</h2>
      <div className="dash-quick__grid">
        {defs.map((action) => {
          const Icon = action.icon

          if (action.id === 'refresh') {
            return (
              <button
                key={action.id}
                type="button"
                className="dash-quick__btn"
                onClick={action.onClick}
              >
                <span className="dash-quick__btn-icon">
                  <Icon size={24} strokeWidth={1.75} />
                </span>
                <span className="dash-quick__btn-label">{action.label}</span>
                <span className="dash-quick__btn-hint">{action.hint}</span>
              </button>
            )
          }

          const allowed = canAccessRoute(user, action.to!)
          if (!allowed) {
            return (
              <div
                key={action.id}
                className="dash-quick__btn dash-quick__btn--disabled"
                title={d.actionDisabledRole}
              >
                <span className="dash-quick__btn-icon">
                  <Icon size={24} strokeWidth={1.75} />
                </span>
                <span className="dash-quick__btn-label">{action.label}</span>
                <span className="dash-quick__btn-hint">{d.actionDisabledRole}</span>
              </div>
            )
          }

          return (
            <Link key={action.id} to={action.to!} className="dash-quick__btn">
              <span className="dash-quick__btn-icon">
                <Icon size={24} strokeWidth={1.75} />
              </span>
              <span className="dash-quick__btn-label">{action.label}</span>
              <span className="dash-quick__btn-hint">{action.hint}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
