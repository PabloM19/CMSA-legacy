import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import { resolveSafetyAlarmMock } from '../../../utils/safetyAlarmMock'

interface SafetyAlarmModalProps {
  activatedAt: number
  onResolved: () => void
}

export function SafetyAlarmModal({ activatedAt, onResolved }: SafetyAlarmModalProps) {
  const { t } = useLanguage()
  const d = t.plantMap
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const tick = () => setElapsed(Math.floor((Date.now() - activatedAt) / 1000))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [activatedAt])

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')

  function handleResolve() {
    resolveSafetyAlarmMock()
    onResolved()
  }

  return (
    <div className="safety-alarm-overlay" role="alertdialog" aria-modal="true" aria-labelledby="safety-alarm-title">
      <div className="safety-alarm-modal">
        <div className="safety-alarm-modal__icon" aria-hidden="true">
          <ShieldAlert size={40} strokeWidth={1.75} />
        </div>
        <h2 id="safety-alarm-title" className="safety-alarm-modal__title">
          {d.safetyAlarmTitle}
        </h2>
        <p className="safety-alarm-modal__text">{d.safetyAlarmText}</p>
        <p className="safety-alarm-modal__timer">
          {d.safetyAlarmTimerLabel}: {minutes}:{seconds}
        </p>
        <button type="button" className="order-btn order-btn--primary safety-alarm-modal__btn" onClick={handleResolve}>
          {d.safetyAlarmResolve}
        </button>
      </div>
    </div>
  )
}
