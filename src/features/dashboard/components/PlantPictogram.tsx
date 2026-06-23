import { AlertTriangle, Check, Rabbit, Turtle } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantPalletizer, PlantTable } from '../../../types/dashboard'

interface PlantPictogramProps {
  tables: PlantTable[]
  palletizers: PlantPalletizer[]
}

function PaceIcon({ pace }: { pace: PlantTable['pace'] }) {
  if (pace === 'slow') return <Turtle size={14} aria-hidden="true" />
  if (pace === 'fast') return <Rabbit size={14} aria-hidden="true" />
  if (pace === 'normal') return <Check size={14} aria-hidden="true" />
  return null
}

export function PlantPictogram({ tables, palletizers }: PlantPictogramProps) {
  const { t } = useLanguage()
  const d = t.dashboard

  return (
    <section className="dash-card dash-plant">
      <h2 className="dash-section-title">{d.plantMap}</h2>

      <p className="dash-plant__group-label">{d.tables}</p>
      <div className="dash-plant__grid">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`dash-plant__block dash-plant__block--${table.state}`}
            title={
              table.pace === 'slow'
                ? d.paceSlow
                : table.pace === 'fast'
                  ? d.paceFast
                  : table.pace === 'normal'
                    ? d.paceNormal
                    : d.stateIdle
            }
          >
            <span className="dash-plant__block-label">{table.label}</span>
            <span className="dash-plant__block-icon">
              {table.state === 'warning' ? (
                <AlertTriangle size={14} aria-hidden="true" />
              ) : (
                <PaceIcon pace={table.pace} />
              )}
            </span>
          </div>
        ))}
      </div>

      <p className="dash-plant__group-label">{d.palletizers}</p>
      <div className="dash-plant__palletizers">
        {palletizers.map((p) => (
          <div
            key={p.id}
            className={`dash-plant__palletizer dash-plant__palletizer--${p.state}`}
            title={p.state === 'conflict' ? d.stateConflict : d.stateIdle}
          >
            <span>{p.label}</span>
            {p.state === 'conflict' && (
              <AlertTriangle size={14} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
