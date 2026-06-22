import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/orders/new', label: 'Nueva orden' },
  { to: '/backlog', label: 'Backlog' },
  { to: '/validation', label: 'Validación' },
  { to: '/plant-map', label: 'Mapa de planta' },
  { to: '/tablet', label: 'Tablet' },
  { to: '/mobile', label: 'Mobile' },
  { to: '/admin', label: 'Admin' },
]

export function Sidebar() {
  return (
    <aside className="app-layout__sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-title">CMSA</div>
        <div className="sidebar__brand-subtitle">Wireframe Fase 1</div>
      </div>
      <nav className="sidebar__nav">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
