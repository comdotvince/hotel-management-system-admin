import type { BookingStatus } from '../data/hmsMockData'
import { api } from './api'

type BackendBooking = {
  bookingid?: number | string | null
  booking_id?: number | string | null
  roomid?: number | string | null
  room_id?: number | string | null
  guestid?: number | string | null
  guest_id?: number | string | null
  check_in_date?: string | null
  checkin_date?: string | null
  check_out_date?: string | null
  checkout_date?: string | null
  status?: string | null
}

type BackendBookingDateRange = {
  check_in_date?: string | null
  check_out_date?: string | null
}

type CreateBookingResponse = {
  message: string
  bookingId: number
}

export type BookingSnapshot = {
  id: number
  roomId: number
  guestId: number
  checkInDate: string
  checkOutDate: string
  status: BookingStatus
}

export type CreateBookingPayload = {
  roomId: number
  guestId?: number | null
  checkInDate: string
  checkOutDate: string
}

export type BookingDateRange = {
  checkInDate: string
  checkOutDate: string
}

const UNSUPPORTED_STATUS_MESSAGE =
  'The current backend only supports confirming bookings. Checked-in and checked-out states are computed by the backend, and cancel or reset actions are not available yet.'

const coerceNumber = (value: unknown, fallback = 0) => {
  const parsedValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN

  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const coerceDate = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : ''

const toBookingStatus = (value: unknown): BookingStatus => {
  const normalizedValue =
    typeof value === 'string' ? value.trim().toLowerCase() : ''

  if (normalizedValue === 'confirmed') {
    return 'confirmed'
  }

  if (normalizedValue === 'checked in' || normalizedValue === 'checked-in') {
    return 'checked-in'
  }

  if (normalizedValue === 'checked out' || normalizedValue === 'checked-out') {
    return 'checked-out'
  }

  if (normalizedValue === 'canceled' || normalizedValue === 'cancelled') {
    return 'canceled'
  }

  return 'pending'
}

const toBookingSnapshot = (booking: BackendBooking): BookingSnapshot => ({
  id: coerceNumber(booking.bookingid ?? booking.booking_id),
  roomId: coerceNumber(booking.roomid ?? booking.room_id),
  guestId: coerceNumber(booking.guestid ?? booking.guest_id),
  checkInDate: coerceDate(booking.check_in_date ?? booking.checkin_date),
  checkOutDate: coerceDate(booking.check_out_date ?? booking.checkout_date),
  status: toBookingStatus(booking.status),
})

export const bookingService = {
  getBookings: async (): Promise<BookingSnapshot[]> => {
    const bookings = await api.get<BackendBooking[]>('/api/booking/all')
    return bookings.map(toBookingSnapshot)
  },

  createBooking: async (payload: CreateBookingPayload): Promise<number> => {
    const response = await api.post<CreateBookingResponse>('/api/booking/create', {
      roomid: payload.roomId,
      guestid: payload.guestId ?? null,
      checkin_date: payload.checkInDate,
      checkout_date: payload.checkOutDate,
    })

    return response.bookingId
  },

  confirmBooking: async (bookingId: number): Promise<void> => {
    await api.patch<{ message: string }>('/api/booking/confirm', {
      bookingid: bookingId,
    })
  },

  deleteBooking: async (bookingId: number): Promise<void> => {
    await api.delete<{ message: string }>(`/api/booking/${bookingId}`)
  },

  refreshBookingStatuses: async (): Promise<void> => {
    await api.patch<{ message: string }>('/api/booking/alldata', {})
  },

  getBookingsByRoom: async (roomId: number): Promise<BookingDateRange[]> => {
    const bookings = await api.post<BackendBookingDateRange[]>(
      '/api/booking/getbyroom',
      {
        roomid: roomId,
      }
    )

    return bookings.map((booking) => ({
      checkInDate: coerceDate(booking.check_in_date),
      checkOutDate: coerceDate(booking.check_out_date),
    }))
  },

  updateBookingStatus: async (
    bookingId: number,
    nextStatus: BookingStatus
  ): Promise<void> => {
    if (nextStatus !== 'confirmed') {
      throw new Error(UNSUPPORTED_STATUS_MESSAGE)
    }

    await bookingService.confirmBooking(bookingId)
  },
}
