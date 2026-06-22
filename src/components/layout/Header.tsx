export function Header() {
  return (
    <header className="app-layout__header">
      <span className="header__title">Producción compartida SUMO / MAF</span>
      <div className="header__badges">
        <span className="header__badge header__badge--sumo">SUMO</span>
        <span className="header__badge header__badge--maf">MAF</span>
      </div>
    </header>
  )
}
