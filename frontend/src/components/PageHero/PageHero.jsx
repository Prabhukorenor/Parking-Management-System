import './PageHero.css'

function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="page-hero section-card">
      <div>
        {eyebrow && <p className="page-hero__eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        <p className="page-copy">{description}</p>
      </div>
      {children && <div className="page-hero__side">{children}</div>}
    </section>
  )
}

export default PageHero
