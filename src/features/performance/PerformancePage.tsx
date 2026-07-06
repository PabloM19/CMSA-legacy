import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import {
  MOCK_PERFORMANCE_SUMMARY,
  MOCK_STATION_PERFORMANCE,
  findStationPerformance,
} from '../../data/mockPerformance'
import { PerformanceSummary } from './components/PerformanceSummary'
import {
  PerformanceGuestActions,
  PerformanceStationsTable,
  StationPerformanceDrawer,
} from './components/PerformanceStationsTable'
import '../admin/admin.css'
import '../dashboard/dashboard.css'
import './performance.css'

function fmt(n: number, lang: 'es' | 'en') {
  return n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')
}

export function PerformancePage() {
  const { isAuthenticated } = useAuth()
  const { t, lang } = useLanguage()
  const d = t.performance
  const summary = MOCK_PERFORMANCE_SUMMARY
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = selectedId ? findStationPerformance(selectedId) : null

  const maxProd = Math.max(summary.todayProduction, summary.yesterdayProduction)

  return (
    <div className="performance-page">
      <PageHeader
        title={d.title}
        description={d.subtitle}
        showMockBadge
        badgeLabel={isAuthenticated ? d.mockBadge : d.publicBadge}
        action={!isAuthenticated ? <PerformanceGuestActions /> : undefined}
      />

      <PerformanceSummary summary={summary} />

      <section className="performance-compare dash-card">
        <h2 className="performance-compare__title">{d.compareTitle}</h2>
        <div className="performance-compare__bars">
          <div className="performance-compare__row">
            <span>{d.today}</span>
            <div className="performance-compare__track">
              <div
                className="performance-compare__fill"
                style={{ width: `${(summary.todayProduction / maxProd) * 100}%` }}
              />
            </div>
            <strong>{fmt(summary.todayProduction, lang)}</strong>
          </div>
          <div className="performance-compare__row">
            <span>{d.yesterday}</span>
            <div className="performance-compare__track">
              <div
                className="performance-compare__fill performance-compare__fill--muted"
                style={{ width: `${(summary.yesterdayProduction / maxProd) * 100}%` }}
              />
            </div>
            <strong>{fmt(summary.yesterdayProduction, lang)}</strong>
          </div>
        </div>
      </section>

      <PerformanceStationsTable
        rows={MOCK_STATION_PERFORMANCE}
        onSelect={(row) => setSelectedId(row.id)}
      />

      {!isAuthenticated && (
        <p className="performance-page__guest-note">
          {d.guestReadOnlyNote}{' '}
          <Link to="/login" className="performance-page__guest-link">
            {d.guestSignInLink}
          </Link>
        </p>
      )}

      {selected && (
        <StationPerformanceDrawer station={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}
