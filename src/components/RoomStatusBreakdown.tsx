type RoomStatusBreakdownProps = {
  available: number
  occupied: number
  maintenance: number
}

function RoomStatusBreakdown({
  available,
  occupied,
  maintenance,
}: RoomStatusBreakdownProps) {
  const totalRooms = available + occupied + maintenance

  const statusRows = [
    { key: 'available', label: 'Available', count: available },
    { key: 'occupied', label: 'Occupied', count: occupied },
    { key: 'maintenance', label: 'Maintenance', count: maintenance },
  ] as const

  return (
    <div className="room-status-breakdown">
      {statusRows.map((statusRow) => {
        const percentage = totalRooms
          ? Math.round((statusRow.count / totalRooms) * 100)
          : 0

        return (
          <article key={statusRow.key} className="room-status-row">
            <div className="room-status-row-head">
              <span>{statusRow.label}</span>
              <strong>
                {statusRow.count} ({percentage}%)
              </strong>
            </div>

            <div className="room-status-bar-track" aria-hidden="true">
              <div
                className={`room-status-bar ${statusRow.key}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default RoomStatusBreakdown
