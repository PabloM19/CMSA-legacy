interface PagePlaceholderProps {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="page-placeholder">
      <h1 className="page-placeholder__title">{title}</h1>
      <p className="page-placeholder__description">{description}</p>
    </section>
  )
}
