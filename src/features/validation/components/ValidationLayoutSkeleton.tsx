export function ValidationLayoutSkeleton() {
  return (
    <div className="validation-layout validation-layout--skeleton" aria-hidden="true">
      <div className="validation-list">
        <div className="validation-skeleton__chip-row">
          <div className="validation-skeleton__chip" />
          <div className="validation-skeleton__chip" />
          <div className="validation-skeleton__chip" />
        </div>
        <div className="validation-skeleton__order" />
        <div className="validation-skeleton__order" />
      </div>
      <div className="validation-panel">
        <div className="validation-skeleton__detail" />
        <div className="validation-skeleton__table" />
        <div className="validation-skeleton__table" />
      </div>
    </div>
  )
}
