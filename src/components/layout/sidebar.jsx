import { NavLink } from 'react-router-dom'

const items = [
  { to: '/dashboard', label: '⌂' },
  { to: '/portfolio', label: '▣' },
  { to: '/cases', label: '◎' },   // 👉 behalten
  { to: '/tasks', label: '✓' },
  { to: '/help', label: '◌' },
  { to: '/dev', label: '⚙' },
]

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="app-logo">N</div>

      <nav className="app-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `app-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}