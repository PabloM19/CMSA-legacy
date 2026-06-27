import { useLanguage } from '../../../i18n/LanguageContext'
import type { BacklogDensity, BacklogViewMode } from '../../../utils/backlogViewPrefs'

interface BacklogViewControlsProps {
  viewMode: BacklogViewMode
  density: BacklogDensity
  densityDisabled: boolean
  onViewModeChange: (mode: BacklogViewMode) => void
  onDensityChange: (density: BacklogDensity) => void
}

const MODES: BacklogViewMode[] = ['summary', 'full', 'attention', 'mine']

const MODE_LABEL = {
  summary: 'viewModeSummary',
  full: 'viewModeFull',
  attention: 'viewModeAttention',
  mine: 'viewModeMine',
} as const

export function BacklogViewControls({
  viewMode,
  density,
  densityDisabled,
  onViewModeChange,
  onDensityChange,
}: BacklogViewControlsProps) {
  const { t } = useLanguage()
  const d = t.backlog
  const isFullMode = viewMode === 'full'
  const selectValue = isFullMode ? 'all' : String(density === 4 ? 4 : 2)

  return (
    <section className="backlog-view-controls" aria-label={d.viewControlsLabel}>
      <div className="backlog-view-controls__row">
        <div className="backlog-view-chips" role="tablist">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={viewMode === mode}
              className={`backlog-view-chip${viewMode === mode ? ' backlog-view-chip--active' : ''}`}
              onClick={() => onViewModeChange(mode)}
            >
              {d[MODE_LABEL[mode]]}
            </button>
          ))}
        </div>

        <label className="backlog-density">
          <span className="backlog-density__label">{d.densityLabel}</span>
          <select
            className="backlog-density__select ui-select"
            value={selectValue}
            disabled={densityDisabled}
            onChange={(e) => {
              const v = e.target.value
              if (v === 'all') {
                onDensityChange('all')
                return
              }
              onDensityChange(Number(v) === 4 ? 4 : 2)
            }}
          >
            {!isFullMode && (
              <>
                <option value="2">{d.density2}</option>
                <option value="4">{d.density4}</option>
              </>
            )}
            {isFullMode && <option value="all">{d.densityAll}</option>}
          </select>
        </label>
      </div>

      {viewMode === 'summary' && (
        <p className="backlog-view-controls__hint">{d.summaryHint}</p>
      )}
    </section>
  )
}
