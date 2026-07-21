import { PLANT_LOWER_ROW, PLANT_UPPER_ROW } from '../../../data/plantLayout'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { PlantElementView } from '../../../types/plant'
import type { PlantMapViewFilter } from '../../../utils/plantMapViewFilter'
import { viewFilterClass } from '../../../utils/plantMapViewFilter'
import { PlantElementCard } from './PlantElementCard'
import { PlantMapBoardScrollArea } from './PlantMapBoardScrollArea'

interface PlantLayoutProps {
  elements: Map<string, PlantElementView>
  selectedId: string | null
  onSelect: (element: PlantElementView) => void
  boardClassName?: string
  viewFilter?: PlantMapViewFilter
  eventCellCodes?: Set<string>
}

function renderRow(
  ids: readonly string[],
  elements: Map<string, PlantElementView>,
  selectedId: string | null,
  onSelect: (element: PlantElementView) => void,
  viewFilter: PlantMapViewFilter,
  eventCellCodes: Set<string>,
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
        extraClassName={viewFilterClass(element, viewFilter, eventCellCodes)}
      />
    )
  })
}

export function PlantLayout({
  elements,
  selectedId,
  onSelect,
  boardClassName,
  viewFilter = 'all',
  eventCellCodes = new Set(),
}: PlantLayoutProps) {
  const { t } = useLanguage()
  const d = t.plantMap

  return (
    <PlantMapBoardScrollArea>
      <div className={`plant-map-board dash-card${boardClassName ? ` ${boardClassName}` : ''}`}>
        <section className="plant-zone">
          <p className="plant-zone__label">{d.upperZone}</p>
          <div className="plant-zone__row">
            {renderRow(PLANT_UPPER_ROW, elements, selectedId, onSelect, viewFilter, eventCellCodes)}
          </div>
        </section>

        <div className="plant-map-board__aisle" aria-hidden="true" />

        <section className="plant-zone">
          <p className="plant-zone__label">{d.lowerZone}</p>
          <div className="plant-zone__row">
            {renderRow(PLANT_LOWER_ROW, elements, selectedId, onSelect, viewFilter, eventCellCodes)}
          </div>
        </section>
      </div>
    </PlantMapBoardScrollArea>
  )
}
