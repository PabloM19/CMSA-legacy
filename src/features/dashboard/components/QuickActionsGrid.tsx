import { ClipboardCheck, LayoutGrid, Map, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import { canAccessRoute } from '../../../utils/permissions'

type ActionId = 'newOrder' | 'backlog' | 'validation' | 'plantMap'

interface QuickAction {
  id: ActionId
  to: string
  icon: typeof Plus
  labelKey: 'actionNewOrder' | 'actionBacklog' | 'actionValidation' | 'actionPlant'
  hintKey: 'actionNewOrderHint' | 'actionBacklogHint' | 'actionValidationHint' | 'actionPlantHint'
  visible: boolean
}

function isQuickActionVisible(
  id: ActionId,
  role: string,
): boolean {
  if (role === 'master') return true
  if (role === 'validator') return id === 'validation' || id === 'plantMap'
  if (role === 'user') return id === 'newOrder' || id === 'backlog' || id === 'plantMap'
  return false
}

export function QuickActionsGrid() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.dashboard

  if (!user) return null

  const defs: Omit<QuickAction, 'visible'>[] = [
    {
      id: 'newOrder',
      to: '/orders/new',
      icon: Plus,
      labelKey: 'actionNewOrder',
      hintKey: 'actionNewOrderHint',
    },
    {
      id: 'backlog',
      to: '/backlog',
      icon: LayoutGrid,
      labelKey: 'actionBacklog',
      hintKey: 'actionBacklogHint',
    },
    {
      id: 'validation',
      to: '/validation',
      icon: ClipboardCheck,
      labelKey: 'actionValidation',
      hintKey: 'actionValidationHint',
    },
    {
      id: 'plantMap',
      to: '/plant-map',
      icon: Map,
      labelKey: 'actionPlant',
      hintKey: 'actionPlantHint',
    },
  ]

  const actions = defs
    .map((def) => ({
      ...def,
      visible: isQuickActionVisible(def.id, user.role),
    }))
    .filter((a) => a.visible)

  return (
    <section className="dash-quick">
      <h2 className="dash-quick__title">{d.quickActionsTitle}</h2>
      <div className="dash-quick__grid">
        {actions.map((action) => {
          const Icon = action.icon
          const allowed = canAccessRoute(user, action.to)
          const disabled = !allowed

          if (disabled) {
            return (
              <div
                key={action.id}
                className="dash-quick__btn dash-quick__btn--disabled"
                title={d.actionDisabledRole}
              >
                <span className="dash-quick__btn-icon">
                  <Icon size={24} strokeWidth={1.75} />
                </span>
                <span className="dash-quick__btn-label">{d[action.labelKey]}</span>
                <span className="dash-quick__btn-hint">{d.actionDisabledRole}</span>
              </div>
            )
          }

          return (
            <Link key={action.id} to={action.to} className="dash-quick__btn">
              <span className="dash-quick__btn-icon">
                <Icon size={24} strokeWidth={1.75} />
              </span>
              <span className="dash-quick__btn-label">{d[action.labelKey]}</span>
              <span className="dash-quick__btn-hint">{d[action.hintKey]}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
