export function MobilePageSkeleton() {
  return (
    <div className="mobile-v2 mobile-v2--skeleton" aria-hidden="true">
      <div className="mobile-v2-skeleton__header" />
      <div className="mobile-v2-skeleton__hero" />
      <div className="mobile-v2-skeleton__grid">
        <div />
        <div />
        <div />
        <div />
      </div>
      <div className="mobile-v2-skeleton__card" />
      <div className="mobile-v2-skeleton__card" />
    </div>
  )
}
