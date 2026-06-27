import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { AttentionItem } from '../../../utils/dashboardHelpers'

interface AttentionPanelProps {
  items: AttentionItem[]
}

function AttentionIcon({ kind }: { kind: AttentionItem['kind'] }) {
  const size = 20
  switch (kind) {
    case 'validation':
      return <ClipboardCheck size={size} strokeWidth={1.75} />
    case 'critical':
      return <ShieldAlert size={size} strokeWidth={1.75} />
    case 'conflict':
      return <AlertTriangle size={size} strokeWidth={1.75} />
    case 'finishing':
      return <Clock size={size} strokeWidth={1.75} />
    case 'blocked':
      return <Ban size={size} strokeWidth={1.75} />
    default:
      return <AlertTriangle size={size} strokeWidth={1.75} />
  }
}

export function AttentionPanel({ items }: AttentionPanelProps) {
  const { t } = useLanguage()
  const d = t.dashboard

  const actionLabel = (key?: AttentionItem['actionKey']) => {
    if (key === 'goValidation') return d.goValidation
    if (key === 'goPlant') return d.goPlant
    if (key === 'goBacklog') return d.goBacklog
    return d.viewDetail
  }

  return (
    <section className="dash-card dash-attention">
      <h2 className="dash-section-title">{d.attentionTitle}</h2>

      {items.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={28} strokeWidth={1.5} />}
          title={d.attentionEmptyTitle}
          description={d.attentionEmptyDesc}
          className="dash-attention__empty"
        />
      ) : (
        <ul className="dash-attention__list">
          {items.map((item) => (
            <li key={item.id} className={`dash-attention__item dash-attention__item--${item.kind}`}>
              <span className="dash-attention__icon" aria-hidden="true">
                <AttentionIcon kind={item.kind} />
              </span>
              <div className="dash-attention__body">
                <p className="dash-attention__title">{item.title}</p>
                {item.detail && <p className="dash-attention__detail">{item.detail}</p>}
              </div>
              {item.actionTo && (
                <Link to={item.actionTo} className="dash-attention__action">
                  {actionLabel(item.actionKey)}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
