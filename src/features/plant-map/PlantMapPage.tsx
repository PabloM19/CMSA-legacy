import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import type { PlantElementView } from '../../types/plant'
import { getState } from '../../utils/backlogStorage'
import { buildPlantElementMap } from '../../utils/plantMapHelpers'
import { PlantElementDrawer } from './components/PlantElementDrawer'
import { PlantLayout } from './components/PlantLayout'
import { PlantLegend } from './components/PlantLegend'
import './plant-map.css'

export function PlantMapPage() {
  const { t, lang } = useLanguage()
  const d = t.plantMap

  const [state, setState] = useState(() => getState())

  useEffect(() => {
    setState(getState())
  }, [])
  const [selected, setSelected] = useState<PlantElementView | null>(null)

  const elements = useMemo(
    () =>
      buildPlantElementMap(
        state.plantTables,
        state.plantPalletizers,
        state.orders,
        lang,
      ),
    [state, lang],
  )

  return (
    <div className="plant-map-page">
      <header className="plant-map-page__header">
        <h1 className="plant-map-page__title">{d.title}</h1>
        <p className="plant-map-page__subtitle">{d.subtitle}</p>
      </header>

      <PlantLegend />

      <PlantLayout
        elements={elements}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
      />

      <PlantElementDrawer element={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
