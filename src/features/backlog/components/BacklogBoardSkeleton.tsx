import { BACKLOG_COLUMNS } from './BacklogColumn'

export function BacklogBoardSkeleton() {
  return (
    <div className="backlog-board backlog-board--skeleton" aria-hidden="true">
      {BACKLOG_COLUMNS.map((columnId) => (
        <div key={columnId} className="backlog-column backlog-column--skeleton dash-card">
          <div className="backlog-skeleton__head">
            <div className="backlog-skeleton__icon" />
            <div className="backlog-skeleton__lines">
              <div className="backlog-skeleton__line backlog-skeleton__line--title" />
              <div className="backlog-skeleton__line backlog-skeleton__line--hint" />
            </div>
            <div className="backlog-skeleton__count" />
          </div>
          <div className="backlog-column__list">
            <div className="backlog-skeleton__card" />
            <div className="backlog-skeleton__card" />
          </div>
        </div>
      ))}
    </div>
  )
}
