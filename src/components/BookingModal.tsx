import { useCallback, useEffect, useState } from 'react'
import type { Booking, BookingStatus } from './BookingView'

type BookingModalProps = {
  booking: Booking | null
  onClose: () => void
  onStatusChange: (bookingId: number, nextStatus: BookingStatus) => void
  onConfirmBooking: (bookingId: number) => void
  onCancelBooking: (bookingId: number) => void
}

const bookingStatusOptions: BookingStatus[] = [
  'pending',
  'confirmed',
  'checked-in',
  'checked-out',
  'canceled',
]

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

const formatStatusLabel = (status: BookingStatus) => {
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

type BookingConfirmationDialog = {
  title: string
  message: string
  confirmLabel: string
  tone: 'default' | 'danger'
  onConfirm: () => void
}

function BookingModal({
  booking,
  onClose,
  onStatusChange,
  onConfirmBooking,
  onCancelBooking,
}: BookingModalProps) {
  const [confirmationDialog, setConfirmationDialog] =
    useState<BookingConfirmationDialog | null>(null)

  const handleCloseModal = useCallback(() => {
    setConfirmationDialog(null)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!booking) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirmationDialog) {
          setConfirmationDialog(null)
          return
        }

        handleCloseModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [booking, confirmationDialog, handleCloseModal])

  if (!booking) {
    return null
  }

  const openConfirmationDialog = (dialog: BookingConfirmationDialog) => {
    setConfirmationDialog(dialog)
  }

  const closeConfirmationDialog = () => {
    setConfirmationDialog(null)
  }

  const submitConfirmationDialog = () => {
    if (!confirmationDialog) {
      return
    }

    confirmationDialog.onConfirm()
    setConfirmationDialog(null)
  }

  const handleStatusSelectChange = (nextStatus: BookingStatus) => {
    if (nextStatus === booking.status) {
      return
    }

    if (nextStatus === 'confirmed') {
      openConfirmationDialog({
        title: 'Confirm Booking',
        message: `Confirm booking for ${booking.clientFullName}?`,
        confirmLabel: 'Confirm',
        tone: 'default',
        onConfirm: () => onConfirmBooking(booking.id),
      })
      return
    }

    if (nextStatus === 'canceled') {
      openConfirmationDialog({
        title: 'Cancel Booking',
        message: `Cancel booking for ${booking.clientFullName}? This cannot be undone.`,
        confirmLabel: 'Cancel Booking',
        tone: 'danger',
        onConfirm: () => onCancelBooking(booking.id),
      })
      return
    }

    onStatusChange(booking.id, nextStatus)
  }

  const handleConfirmBookingClick = () => {
    openConfirmationDialog({
      title: 'Confirm Booking',
      message: `Confirm booking for ${booking.clientFullName}?`,
      confirmLabel: 'Confirm',
      tone: 'default',
      onConfirm: () => onConfirmBooking(booking.id),
    })
  }

  const handleCancelBookingClick = () => {
    openConfirmationDialog({
      title: 'Cancel Booking',
      message: `Cancel booking for ${booking.clientFullName}? This cannot be undone.`,
      confirmLabel: 'Cancel Booking',
      tone: 'danger',
      onConfirm: () => onCancelBooking(booking.id),
    })
  }

  return (
    <div
      className="booking-modal-backdrop"
      role="presentation"
      onClick={handleCloseModal}
    >
      <section
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="booking-modal-head">
          <h4 id="booking-modal-title">Booking Details</h4>
          <button
            type="button"
            className="booking-close-button"
            onClick={handleCloseModal}
            aria-label="Close booking modal"
          >
            Close
          </button>
        </div>

        <div className="booking-modal-grid">
          <article className="booking-detail-item">
            <span>Client Full Name</span>
            <strong>{booking.clientFullName}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Email</span>
            <strong>{booking.email}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Phone</span>
            <strong>{booking.phone}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Room Number</span>
            <strong>{booking.roomNumber}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Room Type</span>
            <strong>{booking.roomType}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Guests</span>
            <strong>{booking.guests}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Nights</span>
            <strong>{booking.nights}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Check-in Date</span>
            <strong>{formatDate(booking.checkInDate)}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Check-out Date</span>
            <strong>{formatDate(booking.checkOutDate)}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Total Price</span>
            <strong>{currencyFormatter.format(booking.totalPrice)}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Payment Method</span>
            <strong>{booking.paymentMethod}</strong>
          </article>
          <article className="booking-detail-item">
            <span>Special Requests</span>
            <strong>{booking.specialRequests}</strong>
          </article>
        </div>

        <div className="booking-modal-actions">
          <label className="booking-status-field">
            Change status
            <select
              value={booking.status}
              disabled={Boolean(confirmationDialog)}
              onChange={(event) =>
                handleStatusSelectChange(event.target.value as BookingStatus)
              }
            >
              {bookingStatusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {formatStatusLabel(statusOption)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="booking-confirm-button"
            onClick={handleConfirmBookingClick}
            disabled={booking.status !== 'pending' || Boolean(confirmationDialog)}
          >
            Confirm Booking
          </button>

          <button
            type="button"
            className="booking-cancel-button"
            onClick={handleCancelBookingClick}
            disabled={booking.status === 'canceled' || Boolean(confirmationDialog)}
          >
            Cancel Booking
          </button>
        </div>

        {confirmationDialog ? (
          <div
            className="booking-confirm-overlay"
            role="presentation"
            onClick={closeConfirmationDialog}
          >
            <section
              className="booking-confirm-popup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-confirm-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h5 id="booking-confirm-title">{confirmationDialog.title}</h5>
              <p>{confirmationDialog.message}</p>

              <div className="booking-confirm-actions">
                <button
                  type="button"
                  className="booking-confirm-secondary"
                  onClick={closeConfirmationDialog}
                >
                  Keep
                </button>
                <button
                  type="button"
                  className={`booking-confirm-primary ${confirmationDialog.tone === 'danger' ? 'danger' : ''}`}
                  onClick={submitConfirmationDialog}
                >
                  {confirmationDialog.confirmLabel}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default BookingModal
