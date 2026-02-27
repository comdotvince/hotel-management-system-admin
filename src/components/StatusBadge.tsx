import type { BookingStatus, RoomStatus } from '../data/hmsMockData'

type StatusBadgeValue = RoomStatus | BookingStatus

type StatusBadgeProps = {
  status: StatusBadgeValue
}

const statusLabelMap: Record<StatusBadgeValue, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  pending: 'Pending',
  confirmed: 'Confirmed',
  'checked-in': 'Checked-in',
  'checked-out': 'Checked-out',
  canceled: 'Canceled',
}

function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`hms-status-badge ${status}`}>{statusLabelMap[status]}</span>
}

export default StatusBadge
