import { useMemo, useState } from 'react'
import {
  mockOverviewBookings,
  mockRevenueEntries,
  mockRoomInventory,
} from '../data/mockData'
import RecentBookings from './RecentBookings'
import RoomStatusBreakdown from './RoomStatusBreakdown'
import SummaryCard from './SummaryCard'

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
})

const weekRangeFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
})

const parseIsoDate = (isoDate: string) => new Date(`${isoDate}T00:00:00`)

const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getWeekStart = (referenceDate: Date) => {
  const weekStartDate = new Date(referenceDate)
  weekStartDate.setHours(0, 0, 0, 0)
  const dayOffset = (weekStartDate.getDay() + 6) % 7
  weekStartDate.setDate(weekStartDate.getDate() - dayOffset)
  return weekStartDate
}

function DashboardOverview() {
  const [recentLimit] = useState(5)

  // Freeze today's date key for the lifetime of the view.
  const todayKey = useMemo(() => toLocalIsoDate(new Date()), [])

  // Build room counters once from mock room inventory data.
  const roomSummary = useMemo(() => {
    const availableRooms = mockRoomInventory.filter(
      (room) => room.status === 'available'
    ).length
    const occupiedRooms = mockRoomInventory.filter(
      (room) => room.status === 'occupied'
    ).length
    const maintenanceRooms = mockRoomInventory.filter(
      (room) => room.status === 'maintenance'
    ).length

    return {
      totalRooms: mockRoomInventory.length,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
    }
  }, [])

  // Derive booking widgets from shared booking mock data.
  const bookingSummary = useMemo(() => {
    const recentBookings = [...mockOverviewBookings]
      .sort(
        (firstBooking, secondBooking) =>
          parseIsoDate(secondBooking.checkInDate).getTime() -
          parseIsoDate(firstBooking.checkInDate).getTime()
      )
      .slice(0, recentLimit)

    const todaysCheckIns = mockOverviewBookings.filter(
      (booking) => booking.checkInDate === todayKey
    ).length

    const todaysCheckOuts = mockOverviewBookings.filter(
      (booking) => booking.checkOutDate === todayKey
    ).length

    return {
      recentBookings,
      todaysCheckIns,
      todaysCheckOuts,
    }
  }, [recentLimit, todayKey])

  // Compute revenue totals for cards and snapshot section.
  const revenueSummary = useMemo(() => {
    const totalRevenue = mockRevenueEntries.reduce(
      (accumulatedAmount, revenueEntry) =>
        accumulatedAmount + revenueEntry.amount,
      0
    )

    const todayRevenue = mockRevenueEntries
      .filter((revenueEntry) => revenueEntry.date === todayKey)
      .reduce(
        (accumulatedAmount, revenueEntry) =>
          accumulatedAmount + revenueEntry.amount,
        0
      )

    const weekStartDate = getWeekStart(new Date())
    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekStartDate.getDate() + 6)
    weekEndDate.setHours(23, 59, 59, 999)

    const weekRevenue = mockRevenueEntries
      .filter((revenueEntry) => {
        const revenueDate = parseIsoDate(revenueEntry.date)
        return revenueDate >= weekStartDate && revenueDate <= weekEndDate
      })
      .reduce(
        (accumulatedAmount, revenueEntry) =>
          accumulatedAmount + revenueEntry.amount,
        0
      )

    const weekLabel = `${weekRangeFormatter.format(weekStartDate)} - ${weekRangeFormatter.format(weekEndDate)}`

    return {
      totalRevenue,
      todayRevenue,
      weekRevenue,
      weekLabel,
    }
  }, [todayKey])

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Rooms',
        value: roomSummary.totalRooms.toLocaleString(),
      },
      {
        label: 'Available Rooms',
        value: roomSummary.availableRooms.toLocaleString(),
      },
      {
        label: 'Occupied Rooms',
        value: roomSummary.occupiedRooms.toLocaleString(),
      },
      {
        label: "Today's Check-ins",
        value: bookingSummary.todaysCheckIns.toLocaleString(),
      },
      {
        label: "Today's Check-outs",
        value: bookingSummary.todaysCheckOuts.toLocaleString(),
      },
      {
        label: 'Total Revenue',
        value: currencyFormatter.format(revenueSummary.totalRevenue),
      },
    ],
    [bookingSummary, revenueSummary.totalRevenue, roomSummary]
  )

  return (
    <div className="overview-layout">
      <section className="overview-summary-grid">
        {summaryCards.map((summaryCard) => (
          <SummaryCard
            key={summaryCard.label}
            label={summaryCard.label}
            value={summaryCard.value}
          />
        ))}
      </section>

      <section className="dashboard-panel">
        <h3>Recent Bookings</h3>
        <RecentBookings bookings={bookingSummary.recentBookings} />
      </section>

      <div className="overview-secondary-grid">
        <section className="dashboard-panel">
          <h3>Room Status Breakdown</h3>
          <RoomStatusBreakdown
            available={roomSummary.availableRooms}
            occupied={roomSummary.occupiedRooms}
            maintenance={roomSummary.maintenanceRooms}
          />
        </section>

        <section className="dashboard-panel">
          <h3>Revenue Snapshot</h3>
          <div className="revenue-snapshot-grid">
            <article className="revenue-snapshot-card">
              <span>Today</span>
              <strong>{currencyFormatter.format(revenueSummary.todayRevenue)}</strong>
            </article>

            <article className="revenue-snapshot-card">
              <span>This Week</span>
              <strong>{currencyFormatter.format(revenueSummary.weekRevenue)}</strong>
              <small>{revenueSummary.weekLabel}</small>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardOverview
