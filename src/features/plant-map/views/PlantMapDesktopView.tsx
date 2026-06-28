import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView } from '../../../types/plant'
import { getState } from '../../../utils/backlogStorage'
import { buildPlantElementMap } from '../../../utils/plantMapHelpers'
import { computePlantMapSummaryStats } from '../../../utils/plantMapSummaryHelpers'
import { PlantElementDrawer } from '../components/PlantElementDrawer'
import { PlantLayout } from '../components/PlantLayout'
import { PlantLegend } from '../components/PlantLegend'
import { PlantMapSummary } from '../components/PlantMapSummary'
import '../plant-map.css'

/** Vista escritorio — se activa por ancho (≥1100px) dentro de /plant-map */
export function PlantMapDesktopView() {
  const { t, lang } = useLanguage()
  const d = t.plantMap

  const [state, setState] = useState(() => getState())
  const [selected, setSelected] = useState<PlantElementView | null>(null)

  useEffect(() => {
    setState(getState())
    setSelected(null)
  }, [])

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

  const summaryStats = useMemo(
    () => computePlantMapSummaryStats(elements, state.orders),
    [elements, state.orders],
  )

  return (
    <div className="plant-map-page">
      <PageHeader title={d.title} description={d.subtitle} showMockBadge />

      <PlantMapSummary stats={summaryStats} />

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
