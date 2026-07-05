import { LayoutGrid, Map, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../features/auth/AuthContext'
import { useLanguage } from '../../../i18n/LanguageContext'
import { canAccessRoute } from '../../../utils/permissions'

interface QuickActionDef {
  id: string
  to: string
  icon: typeof Plus
  labelKey: 'actionNewOrder' | 'actionBacklog' | 'actionPlant'
  hintKey: 'actionNewOrderHint' | 'actionBacklogHint' | 'actionPlantHint'
}

export function QuickActionsGrid() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const d = t.dashboard

  if (!user) return null

  const defs: QuickActionDef[] = [
    {
      id: 'newOrder',
      to: '/orders/new',
      icon: Plus,
      labelKey: 'actionNewOrder',
      hintKey: 'actionNewOrderHint',
    },
    {
      id: 'backlog',
      to: '/daily-orders',
      icon: LayoutGrid,
      labelKey: 'actionBacklog',
      hintKey: 'actionBacklogHint',
    },
    {
      id: 'plantMap',
      to: '/plant-map',
      icon: Map,
      labelKey: 'actionPlant',
      hintKey: 'actionPlantHint',
    },
  ]

  const actions = defs.filter((def) => canAccessRoute(user, def.to))

  return (
    <section className="dash-quick">
      <h2 className="dash-quick__title">{d.quickActionsTitle}</h2>
      <div className="dash-quick__grid">
        {actions.map((action) => {
          const Icon = action.icon

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
