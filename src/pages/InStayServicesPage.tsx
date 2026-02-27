import { useMemo, useState } from 'react'
import DataTable, { type DataTableColumn } from '../components/DataTable'
import type {
  BookingRecord,
  GuestRecord,
  ServiceCatalogRecord,
  ServiceChargeRecord,
} from '../data/hmsMockData'

type InStayServicesPageProps = {
  bookings: BookingRecord[]
  guests: GuestRecord[]
  serviceCatalog: ServiceCatalogRecord[]
  serviceCharges: ServiceChargeRecord[]
  onAddServiceCharge: (payload: {
    bookingId: number
    serviceId: number
    quantity: number
  }) => void
}

type ServiceChargeRow = {
  id: number
  chargedAt: string
  guestName: string
  roomNumber: string
  serviceName: string
  quantity: number
  amount: number
}

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
})

function InStayServicesPage({
  bookings,
  guests,
  serviceCatalog,
  serviceCharges,
  onAddServiceCharge,
}: InStayServicesPageProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState('1')

  const activeBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'checked-in'),
    [bookings]
  )

  const guestNameById = useMemo(
    () => new Map(guests.map((guest) => [guest.id, guest.fullName] as const)),
    [guests]
  )

  const serviceById = useMemo(
    () => new Map(serviceCatalog.map((service) => [service.id, service] as const)),
    [serviceCatalog]
  )

  const resolvedSelectedBookingId = useMemo(() => {
    if (!activeBookings.length) {
      return null
    }

    if (
      selectedBookingId &&
      activeBookings.some((booking) => booking.id === selectedBookingId)
    ) {
      return selectedBookingId
    }

    return activeBookings[0].id
  }, [activeBookings, selectedBookingId])

  const resolvedSelectedServiceId = useMemo(() => {
    if (!serviceCatalog.length) {
      return null
    }

    if (selectedServiceId && serviceById.has(selectedServiceId)) {
      return selectedServiceId
    }

    return serviceCatalog[0].id
  }, [selectedServiceId, serviceById, serviceCatalog])

  const selectedService = resolvedSelectedServiceId
    ? serviceById.get(resolvedSelectedServiceId)
    : null
  const parsedQuantity = Math.max(1, Number(quantity) || 1)
  const estimatedAmount = selectedService ? selectedService.unitPrice * parsedQuantity : 0

  const handleAddCharge = () => {
    if (!resolvedSelectedBookingId || !resolvedSelectedServiceId) {
      return
    }

    onAddServiceCharge({
      bookingId: resolvedSelectedBookingId,
      serviceId: resolvedSelectedServiceId,
      quantity: parsedQuantity,
    })

    setQuantity('1')
  }

  const serviceChargeRows: ServiceChargeRow[] = useMemo(() => {
    return [...serviceCharges]
      .sort(
        (firstCharge, secondCharge) =>
          new Date(`${secondCharge.chargedAt}T00:00:00`).getTime() -
          new Date(`${firstCharge.chargedAt}T00:00:00`).getTime()
      )
      .map((serviceCharge) => {
        const booking = bookings.find(
          (bookingItem) => bookingItem.id === serviceCharge.bookingId
        )
        const service = serviceById.get(serviceCharge.serviceId)
        return {
          id: serviceCharge.id,
          chargedAt: serviceCharge.chargedAt,
          guestName: booking
            ? (guestNameById.get(booking.guestId) ?? 'Unknown guest')
            : 'Unknown guest',
          roomNumber: booking?.roomNumber ?? 'N/A',
          serviceName: service?.name ?? 'Unknown service',
          quantity: serviceCharge.quantity,
          amount: serviceCharge.amount,
        }
      })
  }, [bookings, guestNameById, serviceById, serviceCharges])

  const chargeColumns: DataTableColumn<ServiceChargeRow>[] = [
    {
      key: 'chargedAt',
      header: 'Date',
      cell: (row) => dateFormatter.format(new Date(`${row.chargedAt}T00:00:00`)),
    },
    {
      key: 'guestName',
      header: 'Guest',
      cell: (row) => row.guestName,
    },
    {
      key: 'roomNumber',
      header: 'Room',
      cell: (row) => row.roomNumber,
    },
    {
      key: 'serviceName',
      header: 'Service',
      cell: (row) => row.serviceName,
    },
    {
      key: 'quantity',
      header: 'Qty',
      cell: (row) => row.quantity,
      className: 'hms-cell-right',
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (row) => currencyFormatter.format(row.amount),
      className: 'hms-cell-right',
    },
  ]

  return (
    <div className="hms-page-stack">
      <section className="hms-panel">
        <h3>Add Service Charge</h3>
        {activeBookings.length ? (
          <div className="hms-form-grid">
            <label className="hms-field">
              In-House Booking
              <select
                value={resolvedSelectedBookingId ?? ''}
                onChange={(event) => setSelectedBookingId(Number(event.target.value))}
              >
                {activeBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    #{booking.id} • Room {booking.roomNumber} •{' '}
                    {guestNameById.get(booking.guestId) ?? 'Unknown guest'}
                  </option>
                ))}
              </select>
            </label>

            <label className="hms-field">
              Service
              <select
                value={resolvedSelectedServiceId ?? ''}
                onChange={(event) => setSelectedServiceId(Number(event.target.value))}
              >
                {serviceCatalog.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({currencyFormatter.format(service.unitPrice)})
                  </option>
                ))}
              </select>
            </label>

            <label className="hms-field">
              Quantity
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>

            <div className="hms-field">
              <span className="hms-field-label">Estimated Charge</span>
              <strong className="hms-estimate-value">
                {currencyFormatter.format(estimatedAmount)}
              </strong>
            </div>

            <div className="hms-field hms-field-actions">
              <button type="button" className="hms-primary-button" onClick={handleAddCharge}>
                Add Charge
              </button>
            </div>
          </div>
        ) : (
          <p className="hms-empty-text">
            No checked-in bookings yet. Service charges can be added after guest check-in.
          </p>
        )}
      </section>

      <section className="hms-panel">
        <h3>Service Charges</h3>
        <DataTable
          columns={chargeColumns}
          rows={serviceChargeRows}
          getRowKey={(row) => row.id}
          emptyMessage="No service charges recorded."
        />
      </section>
    </div>
  )
}

export default InStayServicesPage
