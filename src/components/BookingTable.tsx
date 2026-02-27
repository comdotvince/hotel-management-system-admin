import type { KeyboardEvent } from 'react'
import type { Booking } from './BookingView'

type SortField = 'client' | 'check-in'
type SortOrder = 'asc' | 'desc'

type BookingTableProps = {
  bookings: Booking[]
  sortField: SortField
  sortOrder: SortOrder
  currentPage: number
  totalPages: number
  onSortChange: (field: SortField) => void
  onPageChange: (page: number) => void
  onOpenBooking: (bookingId: number) => void
}

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
})

const formatDate = (dateValue: string) =>
  dateFormatter.format(new Date(`${dateValue}T00:00:00`))

const formatStatus = (status: Booking['status']) => {
  if (status === 'pending') {
    return 'Pending'
  }

  if (status === 'checked-in') {
    return 'Checked-in'
  }

  if (status === 'checked-out') {
    return 'Checked-out'
  }

  if (status === 'canceled') {
    return 'Canceled'
  }

  return 'Confirmed'
}

const getSortLabel = (
  field: SortField,
  activeField: SortField,
  activeOrder: SortOrder
) => {
  if (field !== activeField) {
    return '↕'
  }

  return activeOrder === 'asc' ? '↑' : '↓'
}

function BookingTable({
  bookings,
  sortField,
  sortOrder,
  currentPage,
  totalPages,
  onSortChange,
  onPageChange,
  onOpenBooking,
}: BookingTableProps) {
  const handleRowKeyDown =
    (bookingId: number) => (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onOpenBooking(bookingId)
      }
    }

  return (
    <>
      <div className="booking-table-wrap">
        <table className="booking-table">
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className="booking-sort-button"
                  onClick={() => onSortChange('client')}
                >
                  Client Full Name{' '}
                  <span>{getSortLabel('client', sortField, sortOrder)}</span>
                </button>
              </th>
              <th>Email</th>
              <th>Room Number</th>
              <th>Room Type</th>
              <th>
                <button
                  type="button"
                  className="booking-sort-button"
                  onClick={() => onSortChange('check-in')}
                >
                  Check-in Date{' '}
                  <span>{getSortLabel('check-in', sortField, sortOrder)}</span>
                </button>
              </th>
              <th>Check-out Date</th>
              <th>Status</th>
              <th>Total Price</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="booking-row"
                onClick={() => onOpenBooking(booking.id)}
                onKeyDown={handleRowKeyDown(booking.id)}
                tabIndex={0}
              >
                <td>{booking.clientFullName}</td>
                <td>{booking.email}</td>
                <td>{booking.roomNumber}</td>
                <td>{booking.roomType}</td>
                <td>{formatDate(booking.checkInDate)}</td>
                <td>{formatDate(booking.checkOutDate)}</td>
                <td>
                  <span className={`booking-status ${booking.status}`}>
                    {formatStatus(booking.status)}
                  </span>
                </td>
                <td>{currencyFormatter.format(booking.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="booking-pagination">
        <button
          type="button"
          className="booking-page-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="booking-page-label">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          className="booking-page-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </>
  )
}

export default BookingTable
