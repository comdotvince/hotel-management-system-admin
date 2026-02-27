type StatCardProps = {
  label: string
  value: string
  note?: string
}

function StatCard({ label, value, note }: StatCardProps) {
  return (
    <article className="hms-stat-card">
      <p className="hms-stat-label">{label}</p>
      <strong className="hms-stat-value">{value}</strong>
      {note ? <span className="hms-stat-note">{note}</span> : null}
    </article>
  )
}

export default StatCard
