type SummaryCardProps = {
  label: string
  value: string
  subtitle?: string
}

function SummaryCard({ label, value, subtitle }: SummaryCardProps) {
  return (
    <article className="summary-card">
      <p className="summary-card-label">{label}</p>
      <strong className="summary-card-value">{value}</strong>
      {subtitle ? <span className="summary-card-subtitle">{subtitle}</span> : null}
    </article>
  )
}

export default SummaryCard
