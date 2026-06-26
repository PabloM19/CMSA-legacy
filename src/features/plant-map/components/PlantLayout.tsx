import { PLANT_LOWER_ROW, PLANT_UPPER_ROW } from '../../../data/plantLayout'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView } from '../../../types/plant'
import { PlantElementCard } from './PlantElementCard'

interface PlantLayoutProps {
  elements: Map<string, PlantElementView>
  selectedId: string | null
  onSelect: (element: PlantElementView) => void
}

function renderRow(
  ids: readonly string[],
  elements: Map<string, PlantElementView>,
  selectedId: string | null,
  onSelect: (element: PlantElementView) => void,
) {
  return ids.map((id) => {
    const element = elements.get(id)
    if (!element) {
      return (
        <div key={id} className="plant-element plant-element--missing">
          {id}
        </div>
      )
    }
    return (
      <PlantElementCard
        key={element.id}
        {...element}
        selected={selectedId === element.id}
        onClick={() => onSelect(element)}
      />
    )
  })
}

export function PlantLayout({ elements, selectedId, onSelect }: PlantLayoutProps) {
  const { t } = useLanguage()
  const d = t.plantMap

  return (
    <div className="plant-map-board dash-card">
      <section className="plant-zone">
        <p className="plant-zone__label">{d.upperZone}</p>
        <div className="plant-zone__row">{renderRow(PLANT_UPPER_ROW, elements, selectedId, onSelect)}</div>
      </section>

      <div className="plant-map-board__aisle" aria-hidden="true" />

      <section className="plant-zone">
        <p className="plant-zone__label">{d.lowerZone}</p>
        <div className="plant-zone__row">{renderRow(PLANT_LOWER_ROW, elements, selectedId, onSelect)}</div>
      </section>
    </div>
  )
}
