import { useMemo, useState } from 'react'
import DataTable, { type DataTableColumn } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import type {
  BookingRecord,
  BookingStatus,
  GuestRecord,
  ServiceCatalogRecord,
  ServiceChargeRecord,
} from '../data/hmsMockData'

type BillingCheckoutPageProps = {
  bookings: BookingRecord[]
  guests: GuestRecord[]
  serviceCatalog: ServiceCatalogRecord[]
  serviceCharges: ServiceChargeRecord[]
  onUpdateBookingStatus: (bookingId: number, status: BookingStatus) => void
}

const TAX_RATE = 0.12

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
})

type BillingTableRow = {
  id: number
  guestName: string
  roomNumber: string
  status: BookingRecord['status']
  totalDue: number
}

function BillingCheckoutPage({
  bookings,
  guests,
  serviceCatalog,
  serviceCharges,
  onUpdateBookingStatus,
}: BillingCheckoutPageProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)

  const activeBillings = useMemo(
    () => bookings.filter((booking) => booking.status !== 'canceled'),
    [bookings]
  )

  const resolvedSelectedBookingId = useMemo(() => {
    if (!activeBillings.length) {
      return null
    }

    if (
      selectedBookingId &&
      activeBillings.some((booking) => booking.id === selectedBookingId)
    ) {
      return selectedBookingId
    }

    return activeBillings[0].id
  }, [activeBillings, selectedBookingId])

  const guestNameById = useMemo(
    () => new Map(guests.map((guest) => [guest.id, guest.fullName] as const)),
    [guests]
  )

  const serviceNameById = useMemo(
    () => new Map(serviceCatalog.map((service) => [service.id, service.name] as const)),
    [serviceCatalog]
  )

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === resolvedSelectedBookingId) ?? null,
    [bookings, resolvedSelectedBookingId]
  )

  const selectedBookingCharges = useMemo(() => {
    if (!selectedBooking) {
      return []
    }

    return serviceCharges.filter(
      (serviceCharge) => serviceCharge.bookingId === selectedBooking.id
    )
  }, [selectedBooking, serviceCharges])

  const selectedBillingTotals = useMemo(() => {
    if (!selectedBooking) {
      return {
        baseAmount: 0,
        serviceAmount: 0,
        subtotal: 0,
        tax: 0,
        grandTotal: 0,
      }
    }

    const serviceAmount = selectedBookingCharges.reduce(
      (total, serviceCharge) => total + serviceCharge.amount,
      0
    )

    const subtotal = selectedBooking.baseAmount + serviceAmount
    const tax = subtotal * TAX_RATE
    const grandTotal = subtotal + tax

    return {
      baseAmount: selectedBooking.baseAmount,
      serviceAmount,
      subtotal,
      tax,
      grandTotal,
    }
  }, [selectedBooking, selectedBookingCharges])

  const billingRows: BillingTableRow[] = useMemo(
    () =>
      activeBillings.map((booking) => {
        const serviceAmount = serviceCharges
          .filter((serviceCharge) => serviceCharge.bookingId === booking.id)
          .reduce((total, serviceCharge) => total + serviceCharge.amount, 0)
        const subtotal = booking.baseAmount + serviceAmount
        const tax = subtotal * TAX_RATE
        return {
          id: booking.id,
          guestName: guestNameById.get(booking.guestId) ?? 'Unknown guest',
          roomNumber: booking.roomNumber,
          status: booking.status,
          totalDue: subtotal + tax,
        }
      }),
    [activeBillings, guestNameById, serviceCharges]
  )

  const billingColumns: DataTableColumn<BillingTableRow>[] = [
    {
      key: 'guest',
      header: 'Guest',
      cell: (row) => row.guestName,
    },
    {
      key: 'room',
      header: 'Room',
      cell: (row) => row.roomNumber,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'totalDue',
      header: 'Total Due',
      cell: (row) => currencyFormatter.format(row.totalDue),
      className: 'hms-cell-right',
    },
  ]

  return (
    <div className="hms-page-stack">
      <section className="hms-panel">
        <div className="hms-panel-head">
          <h3>Billing Overview</h3>
          <label className="hms-field-inline">
            Select Booking
            <select
              value={resolvedSelectedBookingId ?? ''}
              onChange={(event) => setSelectedBookingId(Number(event.target.value))}
            >
              {activeBillings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  #{booking.id} • Room {booking.roomNumber}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedBooking ? (
          <div className="hms-billing-grid">
            <article className="hms-billing-card">
              <span>Guest</span>
              <strong>
                {guestNameById.get(selectedBooking.guestId) ?? 'Unknown guest'}
              </strong>
            </article>
            <article className="hms-billing-card">
              <span>Room</span>
              <strong>{selectedBooking.roomNumber}</strong>
            </article>
            <article className="hms-billing-card">
              <span>Base Room Amount</span>
              <strong>{currencyFormatter.format(selectedBillingTotals.baseAmount)}</strong>
            </article>
            <article className="hms-billing-card">
              <span>Service Charges</span>
              <strong>{currencyFormatter.format(selectedBillingTotals.serviceAmount)}</strong>
            </article>
            <article className="hms-billing-card">
              <span>Tax (12%)</span>
              <strong>{currencyFormatter.format(selectedBillingTotals.tax)}</strong>
            </article>
            <article className="hms-billing-card total">
              <span>Total</span>
              <strong>{currencyFormatter.format(selectedBillingTotals.grandTotal)}</strong>
            </article>
          </div>
        ) : (
          <p className="hms-empty-text">No billable bookings available.</p>
        )}

        {selectedBooking ? (
          <div className="hms-button-row">
            <button
              type="button"
              className="hms-primary-button"
              onClick={() => onUpdateBookingStatus(selectedBooking.id, 'checked-out')}
              disabled={selectedBooking.status === 'checked-out'}
            >
              Mark as Checked-out
            </button>
          </div>
        ) : null}
      </section>

      <section className="hms-panel">
        <h3>Selected Booking Service Charges</h3>
        <div className="hms-inline-list">
          {selectedBookingCharges.length ? (
            selectedBookingCharges.map((serviceCharge) => (
              <article key={serviceCharge.id} className="hms-inline-list-item">
                <span>
                  {serviceNameById.get(serviceCharge.serviceId) ?? 'Unknown service'} x
                  {serviceCharge.quantity}
                </span>
                <strong>{currencyFormatter.format(serviceCharge.amount)}</strong>
              </article>
            ))
          ) : (
            <p className="hms-empty-text">No service charges for this booking.</p>
          )}
        </div>
      </section>

      <section className="hms-panel">
        <h3>All Booking Bills</h3>
        <DataTable
          columns={billingColumns}
          rows={billingRows}
          getRowKey={(row) => row.id}
          emptyMessage="No billing records available."
          onRowClick={(row) => setSelectedBookingId(row.id)}
        />
      </section>
    </div>
  )
}

export default BillingCheckoutPage
