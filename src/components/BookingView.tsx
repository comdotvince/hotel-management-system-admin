import { useMemo, useState } from 'react'
import BookingModal from './BookingModal'
import BookingTable from './BookingTable'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'canceled'

export type Booking = {
  id: number
  clientFullName: string
  email: string
  roomNumber: string
  roomType: string
  checkInDate: string
  checkOutDate: string
  status: BookingStatus
  totalPrice: number
  nights: number
  guests: number
  phone: string
  paymentMethod: 'GCash' | 'Credit Card' | 'Bank Transfer' | 'Cash'
  specialRequests: string
}

type SortField = 'client' | 'check-in'
type SortOrder = 'asc' | 'desc'

const BOOKINGS_PER_PAGE = 5

const initialBookings: Booking[] = [
  {
    id: 1001,
    clientFullName: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    roomNumber: '205',
    roomType: 'Standard Room',
    checkInDate: '2026-03-02',
    checkOutDate: '2026-03-05',
    status: 'pending',
    totalPrice: 10500,
    nights: 3,
    guests: 2,
    phone: '+63 917 123 4567',
    paymentMethod: 'GCash',
    specialRequests: 'Late check-in around 10 PM',
  },
  {
    id: 1002,
    clientFullName: 'John Carlo Reyes',
    email: 'jc.reyes@yahoo.com',
    roomNumber: '314',
    roomType: 'Standard Room',
    checkInDate: '2026-03-01',
    checkOutDate: '2026-03-03',
    status: 'checked-in',
    totalPrice: 6800,
    nights: 2,
    guests: 1,
    phone: '+63 920 222 3344',
    paymentMethod: 'Credit Card',
    specialRequests: 'High floor if possible',
  },
  {
    id: 1003,
    clientFullName: 'Alyssa Dela Cruz',
    email: 'alyssa.dc@outlook.com',
    roomNumber: '503',
    roomType: 'Deluxe Suite',
    checkInDate: '2026-02-25',
    checkOutDate: '2026-02-28',
    status: 'checked-out',
    totalPrice: 18600,
    nights: 3,
    guests: 2,
    phone: '+63 918 555 1001',
    paymentMethod: 'Credit Card',
    specialRequests: 'Anniversary setup',
  },
  {
    id: 1004,
    clientFullName: 'Paolo Mendoza',
    email: 'paolo.mendoza@gmail.com',
    roomNumber: '701',
    roomType: 'Family Suite',
    checkInDate: '2026-03-04',
    checkOutDate: '2026-03-08',
    status: 'confirmed',
    totalPrice: 39200,
    nights: 4,
    guests: 4,
    phone: '+63 917 600 7788',
    paymentMethod: 'Bank Transfer',
    specialRequests: 'Need baby crib',
  },
  {
    id: 1005,
    clientFullName: 'Patricia Lim',
    email: 'patricia.lim@proton.me',
    roomNumber: '410',
    roomType: 'Deluxe Suite',
    checkInDate: '2026-03-10',
    checkOutDate: '2026-03-12',
    status: 'canceled',
    totalPrice: 12800,
    nights: 2,
    guests: 2,
    phone: '+63 919 333 8190',
    paymentMethod: 'GCash',
    specialRequests: 'Airport pickup',
  },
  {
    id: 1006,
    clientFullName: 'Ramon Garcia',
    email: 'ramon.garcia@yahoo.com',
    roomNumber: '109',
    roomType: 'Standard Room',
    checkInDate: '2026-03-06',
    checkOutDate: '2026-03-09',
    status: 'confirmed',
    totalPrice: 10200,
    nights: 3,
    guests: 2,
    phone: '+63 906 888 1122',
    paymentMethod: 'Cash',
    specialRequests: 'Near elevator',
  },
  {
    id: 1007,
    clientFullName: 'Angela Panganiban',
    email: 'angela.panganiban@gmail.com',
    roomNumber: '612',
    roomType: 'Deluxe Suite',
    checkInDate: '2026-03-07',
    checkOutDate: '2026-03-11',
    status: 'pending',
    totalPrice: 25600,
    nights: 4,
    guests: 2,
    phone: '+63 917 400 5510',
    paymentMethod: 'Credit Card',
    specialRequests: 'Feather-free pillows',
  },
  {
    id: 1008,
    clientFullName: 'Dennis Navarro',
    email: 'dennis.navarro@outlook.com',
    roomNumber: '220',
    roomType: 'Standard Room',
    checkInDate: '2026-03-02',
    checkOutDate: '2026-03-04',
    status: 'checked-in',
    totalPrice: 7000,
    nights: 2,
    guests: 2,
    phone: '+63 998 221 4550',
    paymentMethod: 'GCash',
    specialRequests: 'Extra towels',
  },
  {
    id: 1009,
    clientFullName: 'Sofia Valdez',
    email: 'sofia.valdez@gmail.com',
    roomNumber: '804',
    roomType: 'Family Suite',
    checkInDate: '2026-03-12',
    checkOutDate: '2026-03-15',
    status: 'confirmed',
    totalPrice: 29400,
    nights: 3,
    guests: 5,
    phone: '+63 917 729 1188',
    paymentMethod: 'Bank Transfer',
    specialRequests: 'Quiet room',
  },
  {
    id: 1010,
    clientFullName: 'Mark Anthony Flores',
    email: 'mark.flores@proton.me',
    roomNumber: '309',
    roomType: 'Standard Room',
    checkInDate: '2026-03-03',
    checkOutDate: '2026-03-06',
    status: 'confirmed',
    totalPrice: 10350,
    nights: 3,
    guests: 1,
    phone: '+63 915 666 2090',
    paymentMethod: 'Credit Card',
    specialRequests: 'Early breakfast',
  },
  {
    id: 1011,
    clientFullName: 'Jessa Aquino',
    email: 'jessa.aquino@gmail.com',
    roomNumber: '517',
    roomType: 'Deluxe Suite',
    checkInDate: '2026-03-05',
    checkOutDate: '2026-03-07',
    status: 'checked-out',
    totalPrice: 13200,
    nights: 2,
    guests: 2,
    phone: '+63 917 933 7001',
    paymentMethod: 'GCash',
    specialRequests: 'Additional hangers',
  },
  {
    id: 1012,
    clientFullName: 'Karl Sison',
    email: 'karl.sison@yahoo.com',
    roomNumber: '116',
    roomType: 'Standard Room',
    checkInDate: '2026-03-08',
    checkOutDate: '2026-03-09',
    status: 'pending',
    totalPrice: 3400,
    nights: 1,
    guests: 1,
    phone: '+63 948 300 4011',
    paymentMethod: 'Cash',
    specialRequests: 'No special request',
  },
  {
    id: 1013,
    clientFullName: 'Nicole Tan',
    email: 'nicole.tan@gmail.com',
    roomNumber: '722',
    roomType: 'Family Suite',
    checkInDate: '2026-03-14',
    checkOutDate: '2026-03-18',
    status: 'confirmed',
    totalPrice: 40800,
    nights: 4,
    guests: 4,
    phone: '+63 917 108 3399',
    paymentMethod: 'Credit Card',
    specialRequests: 'Connecting rooms if available',
  },
  {
    id: 1014,
    clientFullName: 'Bernadette Yu',
    email: 'bernadette.yu@outlook.com',
    roomNumber: '603',
    roomType: 'Deluxe Suite',
    checkInDate: '2026-03-09',
    checkOutDate: '2026-03-12',
    status: 'canceled',
    totalPrice: 19200,
    nights: 3,
    guests: 2,
    phone: '+63 916 200 5566',
    paymentMethod: 'Bank Transfer',
    specialRequests: 'Non-smoking room',
  },
  {
    id: 1015,
    clientFullName: 'Leandro Bautista',
    email: 'leandro.bautista@gmail.com',
    roomNumber: '212',
    roomType: 'Standard Room',
    checkInDate: '2026-03-11',
    checkOutDate: '2026-03-13',
    status: 'confirmed',
    totalPrice: 6900,
    nights: 2,
    guests: 2,
    phone: '+63 917 500 8800',
    paymentMethod: 'GCash',
    specialRequests: 'Extra pillow',
  },
]

const getDateTimestamp = (value: string) =>
  new Date(`${value}T00:00:00`).getTime()

function BookingView() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [sortField, setSortField] = useState<SortField>('check-in')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)

  // Keep sorting logic memoized so recalculation happens only when inputs change.
  const sortedBookings = useMemo(() => {
    const nextBookings = [...bookings]

    nextBookings.sort((firstBooking, secondBooking) => {
      const comparison =
        sortField === 'client'
          ? firstBooking.clientFullName.localeCompare(secondBooking.clientFullName)
          : getDateTimestamp(firstBooking.checkInDate) -
            getDateTimestamp(secondBooking.checkInDate)

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return nextBookings
  }, [bookings, sortField, sortOrder])

  const totalPages = Math.max(
    1,
    Math.ceil(sortedBookings.length / BOOKINGS_PER_PAGE)
  )

  // Paginate after sorting so each page is deterministic.
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKINGS_PER_PAGE
    return sortedBookings.slice(startIndex, startIndex + BOOKINGS_PER_PAGE)
  }, [currentPage, sortedBookings])

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId]
  )

  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortOrder((currentOrder) =>
        currentOrder === 'asc' ? 'desc' : 'asc'
      )
    } else {
      setSortField(field)
      setSortOrder('asc')
    }

    setCurrentPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, nextPage)))
  }

  const handleStatusChange = (bookingId: number, nextStatus: BookingStatus) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: nextStatus } : booking
      )
    )
  }

  const handleCancelBooking = (bookingId: number) => {
    handleStatusChange(bookingId, 'canceled')
  }

  const handleConfirmBooking = (bookingId: number) => {
    handleStatusChange(bookingId, 'confirmed')
  }

  return (
    <section className="booking-panel">
      <div className="booking-head">
        <div>
          <h3>Booking View</h3>
          <p className="rooms-subtitle">
            {bookings.length} bookings • {BOOKINGS_PER_PAGE} per page
          </p>
        </div>
      </div>

      <BookingTable
        bookings={paginatedBookings}
        sortField={sortField}
        sortOrder={sortOrder}
        currentPage={currentPage}
        totalPages={totalPages}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onOpenBooking={(bookingId) => setSelectedBookingId(bookingId)}
      />

      <BookingModal
        booking={selectedBooking}
        onClose={() => setSelectedBookingId(null)}
        onStatusChange={handleStatusChange}
        onConfirmBooking={handleConfirmBooking}
        onCancelBooking={handleCancelBooking}
      />
    </section>
  )
}

export default BookingView
