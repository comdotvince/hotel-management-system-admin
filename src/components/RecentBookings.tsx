import type { MockBooking } from '../data/mockData'

type RecentBookingsProps = {
  bookings: MockBooking[]
}

const checkInFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const formatBookingStatus = (status: MockBooking['status']) => {
  if (status === 'checked-in') {
    return 'Checked-in'
  }

  if (status === 'checked-out') {
    return 'Checked-out'
  }

  if (status === 'canceled') {
    return 'Canceled'
  }

  if (status === 'pending') {
    return 'Pending'
  }

  return 'Confirmed'
}

function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <div className="recent-bookings-table-wrap">
      <table className="recent-bookings-table">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Room Number</th>
            <th>Check-in</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.clientName}</td>
              <td>{booking.roomNumber}</td>
              <td>
                {checkInFormatter.format(
                  new Date(`${booking.checkInDate}T00:00:00`)
                )}
              </td>
              <td>
                <span className={`recent-booking-status ${booking.status}`}>
                  {formatBookingStatus(booking.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RecentBookings
