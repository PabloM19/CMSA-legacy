import { useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import { resetDemoClean, seedDemoFull } from '../../../utils/demoSeed'
import { AdminConfirmModal } from './AdminConfirmModal'

type DemoAction = 'clean' | 'full' | null

interface DemoModePanelProps {
  onChanged: () => void
}

export function DemoModePanel({ onChanged }: DemoModePanelProps) {
  const { t } = useLanguage()
  const d = t.admin.demo
  const admin = t.admin

  const [confirm, setConfirm] = useState<DemoAction>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  function runAction(action: DemoAction) {
    if (!action) return
    if (action === 'clean') resetDemoClean()
    else seedDemoFull()
    setConfirm(null)
    setFeedback(action === 'clean' ? d.feedbackClean : d.feedbackFull)
    onChanged()
    window.setTimeout(() => {
      window.location.reload()
    }, 600)
  }

  return (
    <section className="admin-demo dash-card">
      <div className="admin-demo__head">
        <h2 className="admin-demo__title">{d.title}</h2>
        <p className="admin-demo__desc">{d.description}</p>
      </div>

      <div className="admin-demo__actions">
        <button type="button" className="admin-btn" onClick={() => setConfirm('clean')}>
          {d.resetClean}
        </button>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setConfirm('full')}>
          {d.loadFull}
        </button>
      </div>

      {feedback && <p className="admin-demo__feedback">{feedback}</p>}

      {confirm === 'clean' && (
        <AdminConfirmModal
          title={d.resetClean}
          message={d.confirmClean}
          confirmLabel={d.confirmAction}
          cancelLabel={admin.cancel}
          destructive
          onConfirm={() => runAction('clean')}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm === 'full' && (
        <AdminConfirmModal
          title={d.loadFull}
          message={d.confirmFull}
          confirmLabel={d.confirmAction}
          cancelLabel={admin.cancel}
          onConfirm={() => runAction('full')}
          onCancel={() => setConfirm(null)}
        />
      )}
    </section>
  )
}
