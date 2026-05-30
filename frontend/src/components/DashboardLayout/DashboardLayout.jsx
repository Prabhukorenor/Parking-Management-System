import { NavLink } from 'react-router-dom'
import './DashboardLayout.css'

function DashboardLayout({ eyebrow, title, description, links, children }) {
  return (
    <div className="page-shell dashboard">
      <aside className="dashboard__sidebar section-card">
        <p className="dashboard__eyebrow">{eyebrow}</p>
        <h1 className="dashboard__title">{title}</h1>
        <p className="dashboard__copy">{description}</p>
        <nav className="dashboard__nav">
          {links.map((link) => (
            <NavLink key={`${link.to}-${link.label}`} to={link.to} className="dashboard__navlink">
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="dashboard__content">{children}</main>
    </div>
  )
}

export default DashboardLayout
