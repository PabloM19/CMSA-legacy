import { CalendarClock, Clock, Gauge, Package, UserRound, Bot } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext'
import type { RecommendedStationCode } from '../../../utils/productionOrderValidation'

interface LaunchOrderSummaryBlockProps {
  etc: string
  endTime: string
  stations: RecommendedStationCode[]
  occupancy: number
}

const STATION_ICON_SIZE = 14

function StationTypeIcon({ type }: { type: RecommendedStationCode['type'] }) {
  if (type === 'manual') {
    return <UserRound size={STATION_ICON_SIZE} aria-hidden="true" />
  }
  if (type === 'palletizer') {
    return <Package size={STATION_ICON_SIZE} aria-hidden="true" />
  }
  return <Bot size={STATION_ICON_SIZE} aria-hidden="true" />
}

export function LaunchOrderSummaryBlock({
  etc,
  endTime,
  stations,
  occupancy,
}: LaunchOrderSummaryBlockProps) {
  const { t } = useLanguage()
  const d = t.backlog

  return (
    <section className="launch-order-summary" aria-label={d.launchSummaryTitle}>
      <h3 className="launch-order-summary__title">{d.launchSummaryTitle}</h3>

      <div className="launch-order-summary__grid">
        <div className="launch-order-summary__card">
          <span className="launch-order-summary__card-icon" aria-hidden="true">
            <Clock size={18} />
          </span>
          <div>
            <span className="launch-order-summary__card-label">{d.etc}</span>
            <strong className="launch-order-summary__card-value">{etc}</strong>
          </div>
        </div>

        <div className="launch-order-summary__card">
          <span className="launch-order-summary__card-icon" aria-hidden="true">
            <CalendarClock size={18} />
          </span>
          <div>
            <span className="launch-order-summary__card-label">{d.endTime}</span>
            <strong className="launch-order-summary__card-value">{endTime}</strong>
          </div>
        </div>

        <div className="launch-order-summary__card launch-order-summary__card--wide">
          <span className="launch-order-summary__card-icon" aria-hidden="true">
            <Gauge size={18} />
          </span>
          <div className="launch-order-summary__occupancy">
            <span className="launch-order-summary__card-label">{d.launchOccupancy}</span>
            <strong className="launch-order-summary__card-value">{occupancy}%</strong>
            <div className="launch-order-summary__occupancy-bar">
              <span
                className="launch-order-summary__occupancy-fill"
                style={{ width: `${occupancy}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="launch-order-summary__stations">
        <span className="launch-order-summary__stations-label">{d.launchAssignedStations}</span>
        <div className="launch-order-summary__station-chips">
          {stations.map((station) => (
            <span key={station.code} className="launch-order-summary__station-chip">
              <StationTypeIcon type={station.type} />
              {station.code}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
