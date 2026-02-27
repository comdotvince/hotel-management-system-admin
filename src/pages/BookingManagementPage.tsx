import { useMemo, useState } from 'react'
import AppModal from '../components/AppModal'
import DataTable, { type DataTableColumn } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import type {
  BookingRecord,
  BookingStatus,
  GuestRecord,
} from '../data/hmsMockData'

type BookingManagementPageProps = {
  bookings: BookingRecord[]
  guests: GuestRecord[]
  onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void
}

type BookingSortField = 'guest' | 'check-in'
type BookingSortDirection = 'asc' | 'desc'

const checkInFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
})

type BookingTableRow = BookingRecord & {
  guestName: string
}

function BookingManagementPage({
  bookings,
  guests,
  onUpdateBookingStatus,
}: BookingManagementPageProps) {
  const [sortField, setSortField] = useState<BookingSortField>('check-in')
  const [sortDirection, setSortDirection] = useState<BookingSortDirection>('desc')
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)

  const guestNameById = useMemo(
    () => new Map(guests.map((guest) => [guest.id, guest.fullName] as const)),
    [guests]
  )

  const sortedBookings: BookingTableRow[] = useMemo(() => {
    const bookingRows = bookings.map((booking) => ({
      ...booking,
      guestName: guestNameById.get(booking.guestId) ?? 'Unknown guest',
    }))

    bookingRows.sort((firstBooking, secondBooking) => {
      const comparisonValue =
        sortField === 'guest'
          ? firstBooking.guestName.localeCompare(secondBooking.guestName)
          : new Date(`${firstBooking.checkInDate}T00:00:00`).getTime() -
            new Date(`${secondBooking.checkInDate}T00:00:00`).getTime()

      return sortDirection === 'asc' ? comparisonValue : -comparisonValue
    })

    return bookingRows
  }, [bookings, guestNameById, sortDirection, sortField])

  const selectedBooking = useMemo(
    () =>
      sortedBookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [selectedBookingId, sortedBookings]
  )

  const toggleSort = (field: BookingSortField) => {
    if (sortField === field) {
      setSortDirection((currentDirection) =>
        currentDirection === 'asc' ? 'desc' : 'asc'
      )
      return
    }

    setSortField(field)
    setSortDirection(field === 'guest' ? 'asc' : 'desc')
  }

  const columns: DataTableColumn<BookingTableRow>[] = [
    {
      key: 'guestName',
      header: 'Client Name',
      cell: (booking) => booking.guestName,
    },
    {
      key: 'roomNumber',
      header: 'Room',
      cell: (booking) => booking.roomNumber,
    },
    {
      key: 'checkInDate',
      header: 'Check-in',
      cell: (booking) =>
        checkInFormatter.format(new Date(`${booking.checkInDate}T00:00:00`)),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (booking) => <StatusBadge status={booking.status} />,
    },
    {
      key: 'baseAmount',
      header: 'Base Amount',
      cell: (booking) => currencyFormatter.format(booking.baseAmount),
      className: 'hms-cell-right',
    },
  ]

  return (
    <div className="hms-page-stack">
      <section className="hms-panel">
        <div className="hms-panel-head">
          <h3>Bookings</h3>
          <div className="hms-button-row">
            <button
              type="button"
              className="hms-ghost-button"
              onClick={() => toggleSort('guest')}
            >
              Sort by Guest ({sortField === 'guest' ? sortDirection : 'off'})
            </button>
            <button
              type="button"
              className="hms-ghost-button"
              onClick={() => toggleSort('check-in')}
            >
              Sort by Check-in (
              {sortField === 'check-in' ? sortDirection : 'off'})
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={sortedBookings}
          getRowKey={(booking) => booking.id}
          emptyMessage="No bookings available."
          onRowClick={(booking) => setSelectedBookingId(booking.id)}
        />
      </section>

      <AppModal
        isOpen={Boolean(selectedBooking)}
        title={selectedBooking ? `Booking #${selectedBooking.id}` : 'Booking'}
        onClose={() => setSelectedBookingId(null)}
      >
        {selectedBooking ? (
          <div className="hms-details-grid">
            <article>
              <span>Guest</span>
              <strong>{selectedBooking.guestName}</strong>
            </article>
            <article>
              <span>Room</span>
              <strong>
                {selectedBooking.roomNumber} ({selectedBooking.roomType})
              </strong>
            </article>
            <article>
              <span>Check-in</span>
              <strong>
                {checkInFormatter.format(
                  new Date(`${selectedBooking.checkInDate}T00:00:00`)
                )}
              </strong>
            </article>
            <article>
              <span>Check-out</span>
              <strong>
                {checkInFormatter.format(
                  new Date(`${selectedBooking.checkOutDate}T00:00:00`)
                )}
              </strong>
            </article>
            <article>
              <span>Status</span>
              <strong>
                <StatusBadge status={selectedBooking.status} />
              </strong>
            </article>
            <article>
              <span>Base Amount</span>
              <strong>{currencyFormatter.format(selectedBooking.baseAmount)}</strong>
            </article>
          </div>
        ) : null}

        {selectedBooking ? (
          <label className="hms-field">
            Change Booking Status
            <select
              value={selectedBooking.status}
              onChange={(event) =>
                onUpdateBookingStatus(
                  selectedBooking.id,
                  event.target.value as BookingStatus
                )
              }
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked-in</option>
              <option value="checked-out">Checked-out</option>
              <option value="canceled">Canceled</option>
            </select>
          </label>
        ) : null}
      </AppModal>
    </div>
  )
}

export default BookingManagementPage
