import { useMemo } from 'react'
import DataTable, { type DataTableColumn } from '../components/DataTable'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import type {
  BookingRecord,
  GuestRecord,
  RoomRecord,
  ServiceChargeRecord,
} from '../data/hmsMockData'
import { toLocalIsoDate } from '../data/hmsMockData'

type DashboardOverviewPageProps = {
  rooms: RoomRecord[]
  bookings: BookingRecord[]
  guests: GuestRecord[]
  serviceCharges: ServiceChargeRecord[]
}

type RecentBookingRow = {
  id: number
  guestName: string
  roomNumber: string
  checkInDate: string
  status: BookingRecord['status']
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function DashboardOverviewPage({
  rooms,
  bookings,
  guests,
  serviceCharges,
}: DashboardOverviewPageProps) {
  const todayKey = useMemo(() => toLocalIsoDate(new Date()), [])

  const guestNameById = useMemo(
    () =>
      new Map(
        guests.map((guest) => [guest.id, guest.fullName] as const)
      ),
    [guests]
  )

  const roomSummary = useMemo(() => {
    const availableRooms = rooms.filter((room) => room.status === 'available').length
    const occupiedRooms = rooms.filter((room) => room.status === 'occupied').length
    const maintenanceRooms = rooms.filter(
      (room) => room.status === 'maintenance'
    ).length

    return {
      totalRooms: rooms.length,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
    }
  }, [rooms])

  const bookingSummary = useMemo(() => {
    const todaysCheckIns = bookings.filter(
      (booking) => booking.checkInDate === todayKey && booking.status !== 'canceled'
    ).length

    const todaysCheckOuts = bookings.filter(
      (booking) => booking.checkOutDate === todayKey && booking.status !== 'canceled'
    ).length

    const validBookingIds = new Set(
      bookings
        .filter((booking) => booking.status !== 'canceled')
        .map((booking) => booking.id)
    )

    const baseRevenue = bookings
      .filter((booking) => booking.status !== 'canceled')
      .reduce((total, booking) => total + booking.baseAmount, 0)

    const serviceRevenue = serviceCharges
      .filter((serviceCharge) => validBookingIds.has(serviceCharge.bookingId))
      .reduce((total, serviceCharge) => total + serviceCharge.amount, 0)

    const totalRevenue = baseRevenue + serviceRevenue

    const recentBookings: RecentBookingRow[] = [...bookings]
      .sort(
        (firstBooking, secondBooking) =>
          new Date(`${secondBooking.checkInDate}T00:00:00`).getTime() -
          new Date(`${firstBooking.checkInDate}T00:00:00`).getTime()
      )
      .slice(0, 5)
      .map((booking) => ({
        id: booking.id,
        guestName: guestNameById.get(booking.guestId) ?? 'Unknown guest',
        roomNumber: booking.roomNumber,
        checkInDate: booking.checkInDate,
        status: booking.status,
      }))

    return {
      todaysCheckIns,
      todaysCheckOuts,
      totalRevenue,
      recentBookings,
    }
  }, [bookings, guestNameById, serviceCharges, todayKey])

  const summaryCards = [
    {
      label: 'Total Rooms',
      value: String(roomSummary.totalRooms),
    },
    {
      label: 'Available Rooms',
      value: String(roomSummary.availableRooms),
    },
    {
      label: 'Occupied Rooms',
      value: String(roomSummary.occupiedRooms),
    },
    {
      label: "Today's Check-ins",
      value: String(bookingSummary.todaysCheckIns),
    },
    {
      label: "Today's Check-outs",
      value: String(bookingSummary.todaysCheckOuts),
    },
    {
      label: 'Total Revenue (PHP)',
      value: currencyFormatter.format(bookingSummary.totalRevenue),
    },
  ]

  const bookingColumns: DataTableColumn<RecentBookingRow>[] = [
    {
      key: 'guestName',
      header: 'Client Name',
      cell: (row) => row.guestName,
    },
    {
      key: 'roomNumber',
      header: 'Room Number',
      cell: (row) => row.roomNumber,
    },
    {
      key: 'checkInDate',
      header: 'Check-in',
      cell: (row) =>
        dateFormatter.format(new Date(`${row.checkInDate}T00:00:00`)),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ]

  const occupancyRows = [
    {
      key: 'available',
      label: 'Available',
      count: roomSummary.availableRooms,
    },
    {
      key: 'occupied',
      label: 'Occupied',
      count: roomSummary.occupiedRooms,
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      count: roomSummary.maintenanceRooms,
    },
  ] as const

  return (
    <div className="hms-page-stack">
      <section className="hms-summary-grid">
        {summaryCards.map((summaryCard) => (
          <StatCard
            key={summaryCard.label}
            label={summaryCard.label}
            value={summaryCard.value}
          />
        ))}
      </section>

      <div className="hms-two-column-grid">
        <section className="hms-panel">
          <h3>Recent Bookings</h3>
          <DataTable
            columns={bookingColumns}
            rows={bookingSummary.recentBookings}
            getRowKey={(row) => row.id}
            emptyMessage="No recent bookings available."
          />
        </section>

        <section className="hms-panel">
          <h3>Room Occupancy Overview</h3>
          <div className="hms-occupancy-list">
            {occupancyRows.map((occupancyRow) => {
              const percentage = roomSummary.totalRooms
                ? Math.round((occupancyRow.count / roomSummary.totalRooms) * 100)
                : 0

              return (
                <article key={occupancyRow.key} className="hms-occupancy-row">
                  <div className="hms-occupancy-row-head">
                    <span>{occupancyRow.label}</span>
                    <strong>
                      {occupancyRow.count} ({percentage}%)
                    </strong>
                  </div>
                  <div className="hms-occupancy-track" aria-hidden="true">
                    <div
                      className={`hms-occupancy-bar ${occupancyRow.key}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardOverviewPage
