import { useMemo } from 'react'
import DataTable, { type DataTableColumn } from '../components/DataTable'
import StatCard from '../components/StatCard'
import type {
  BookingRecord,
  RoomRecord,
  ServiceChargeRecord,
} from '../data/hmsMockData'
import { toLocalIsoDate } from '../data/hmsMockData'

type ReportsPageProps = {
  rooms: RoomRecord[]
  bookings: BookingRecord[]
  serviceCharges: ServiceChargeRecord[]
}

type StatusSummaryRow = {
  label: string
  value: number
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
})

function ReportsPage({ rooms, bookings, serviceCharges }: ReportsPageProps) {
  const todayKey = useMemo(() => toLocalIsoDate(new Date()), [])

  const reportSummary = useMemo(() => {
    const occupiedRooms = rooms.filter((room) => room.status === 'occupied').length
    const availableRooms = rooms.filter((room) => room.status === 'available').length
    const maintenanceRooms = rooms.filter(
      (room) => room.status === 'maintenance'
    ).length

    const occupancyRate = rooms.length
      ? Math.round((occupiedRooms / rooms.length) * 100)
      : 0

    const baseRevenue = bookings
      .filter((booking) => booking.status !== 'canceled')
      .reduce((total, booking) => total + booking.baseAmount, 0)

    const serviceRevenue = serviceCharges.reduce(
      (total, serviceCharge) => total + serviceCharge.amount,
      0
    )

    const totalRevenue = baseRevenue + serviceRevenue

    const todayBaseRevenue = bookings
      .filter((booking) => booking.checkInDate === todayKey && booking.status !== 'canceled')
      .reduce((total, booking) => total + booking.baseAmount, 0)

    const todayServiceRevenue = serviceCharges
      .filter((serviceCharge) => serviceCharge.chargedAt === todayKey)
      .reduce((total, serviceCharge) => total + serviceCharge.amount, 0)

    const todayRevenue = todayBaseRevenue + todayServiceRevenue

    const bookingStatusCounts = {
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
      'checked-in': bookings.filter((booking) => booking.status === 'checked-in')
        .length,
      'checked-out': bookings.filter((booking) => booking.status === 'checked-out')
        .length,
      canceled: bookings.filter((booking) => booking.status === 'canceled').length,
    }

    return {
      occupancyRate,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      totalRevenue,
      todayRevenue,
      bookingStatusCounts,
    }
  }, [bookings, rooms, serviceCharges, todayKey])

  const roomStatusRows: StatusSummaryRow[] = [
    { label: 'Available', value: reportSummary.availableRooms },
    { label: 'Occupied', value: reportSummary.occupiedRooms },
    { label: 'Maintenance', value: reportSummary.maintenanceRooms },
  ]

  const bookingStatusRows: StatusSummaryRow[] = [
    { label: 'Pending', value: reportSummary.bookingStatusCounts.pending },
    { label: 'Confirmed', value: reportSummary.bookingStatusCounts.confirmed },
    { label: 'Checked-in', value: reportSummary.bookingStatusCounts['checked-in'] },
    { label: 'Checked-out', value: reportSummary.bookingStatusCounts['checked-out'] },
    { label: 'Canceled', value: reportSummary.bookingStatusCounts.canceled },
  ]

  const summaryColumns: DataTableColumn<StatusSummaryRow>[] = [
    {
      key: 'label',
      header: 'Metric',
      cell: (row) => row.label,
    },
    {
      key: 'value',
      header: 'Count',
      cell: (row) => row.value,
      className: 'hms-cell-right',
    },
  ]

  return (
    <div className="hms-page-stack">
      <section className="hms-summary-grid">
        <StatCard
          label="Total Revenue"
          value={currencyFormatter.format(reportSummary.totalRevenue)}
        />
        <StatCard
          label="Today's Revenue"
          value={currencyFormatter.format(reportSummary.todayRevenue)}
        />
        <StatCard label="Occupancy Rate" value={`${reportSummary.occupancyRate}%`} />
      </section>

      <div className="hms-two-column-grid">
        <section className="hms-panel">
          <h3>Room Status Summary</h3>
          <DataTable
            columns={summaryColumns}
            rows={roomStatusRows}
            getRowKey={(row) => row.label}
            emptyMessage="No room status data."
          />
        </section>

        <section className="hms-panel">
          <h3>Booking Status Summary</h3>
          <DataTable
            columns={summaryColumns}
            rows={bookingStatusRows}
            getRowKey={(row) => row.label}
            emptyMessage="No booking status data."
          />
        </section>
      </div>
    </div>
  )
}

export default ReportsPage
