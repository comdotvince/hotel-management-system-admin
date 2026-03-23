import { type FormEvent, useEffect, useMemo, useState } from 'react'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import { useAuth } from './context/useAuth'
import type {
  BookingRecord,
  BookingStatus,
  GuestRecord,
  RoomRecord,
} from './data/hmsMockData'
import useRooms from './hooks/useRooms'
import AdminLayout from './layout/AdminLayout'
import {
  getAdminRouteTitle,
  isAdminRoute,
  isAuthRoute,
  type AppRoute,
} from './layout/adminRoutes'
import BookingManagementPage from './pages/BookingManagementPage'
import DashboardOverviewPage from './pages/DashboardOverviewPage'
import RoomManagementPage from './pages/RoomManagementPage'
import { bookingService, type BookingSnapshot } from './services/bookingService'
import type { RoomPayload } from './services/roomService'
import './styles/tokens.css'
import './components/Dashboard/Dashboard.css'
import './components/Rooms/Rooms.css'
import './components/Booking/Booking.css'
import './styles/admin.css'

const resolveRoute = (pathname: string): AppRoute => {
  if (isAuthRoute(pathname)) return pathname
  if (isAdminRoute(pathname)) return pathname
  return '/login'
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const getStayLength = (checkInDate: string, checkOutDate: string) => {
  const checkIn = new Date(`${checkInDate}T00:00:00`)
  const checkOut = new Date(`${checkOutDate}T00:00:00`)
  const differenceInDays = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  )

  return differenceInDays > 0 ? differenceInDays : 1
}

const toGuestName = (guestId: number) =>
  guestId > 0 ? `Guest #${guestId}` : 'Guest'

const toGuestRecords = (bookings: BookingSnapshot[]): GuestRecord[] =>
  [...new Set(bookings.map((booking) => booking.guestId))]
    .sort((firstId, secondId) => firstId - secondId)
    .map((guestId) => ({
      id: guestId,
      fullName: toGuestName(guestId),
      email: '',
      phone: '',
      nationality: '',
      address: '',
      notes: '',
    }))

const toBookingRecord = (
  booking: BookingSnapshot,
  roomById: Map<number, RoomRecord>
): BookingRecord => {
  const room = roomById.get(booking.roomId)

  return {
    id: booking.id,
    guestId: booking.guestId,
    roomNumber: room?.roomNumber ?? (booking.roomId ? String(booking.roomId) : 'N/A'),
    roomType: room?.roomType ?? 'Single',
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    status: booking.status,
    baseAmount:
      (room?.pricePerNight ?? 0) *
      getStayLength(booking.checkInDate, booking.checkOutDate),
  }
}

function App() {
  const {
    isAuthenticated,
    isInitializing,
    isLoading: isAuthLoading,
    login,
    register,
    logout,
  } = useAuth()
  const [route, setRoute] = useState<AppRoute>(() =>
    resolveRoute(window.location.pathname)
  )
  const [authError, setAuthError] = useState<string | null>(null)
  const [bookingSnapshots, setBookingSnapshots] = useState<BookingSnapshot[]>([])
  const [isBookingsLoading, setIsBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState<string | null>(null)

  const {
    rooms,
    isLoading: isRoomsLoading,
    mutationType: roomMutationType,
    error: roomError,
    createRoom,
    updateRoom,
    deleteRoom,
    bulkDeleteRooms,
  } = useRooms()

  const roomById = useMemo(
    () => new Map(rooms.map((room) => [room.id, room] as const)),
    [rooms]
  )

  const bookings = useMemo(
    () => bookingSnapshots.map((booking) => toBookingRecord(booking, roomById)),
    [bookingSnapshots, roomById]
  )

  const guests = useMemo(() => toGuestRecords(bookingSnapshots), [bookingSnapshots])

  const navigate = (nextRoute: AppRoute) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, '', nextRoute)
    }
    setRoute(nextRoute)
  }

  const loadBookings = async () => {
    setIsBookingsLoading(true)
    try {
      const fetchedBookings = await bookingService.getBookings()
      setBookingSnapshots(fetchedBookings)
      setBookingsError(null)
    } catch (error) {
      setBookingsError(
        getErrorMessage(error, 'Unable to load bookings from the backend.')
      )
    } finally {
      setIsBookingsLoading(false)
    }
  }

  useEffect(() => {
    void loadBookings()
  }, [])

  let effectiveRoute: AppRoute = route
  if (isAuthenticated && isAuthRoute(route)) {
    effectiveRoute = '/dashboard'
  } else if (!isAuthenticated && isAdminRoute(route)) {
    effectiveRoute = '/login'
  }

  useEffect(() => {
    if (window.location.pathname !== effectiveRoute) {
      window.history.replaceState({}, '', effectiveRoute)
    }
  }, [effectiveRoute])

  useEffect(() => {
    const handlePopState = () => {
      const next = resolveRoute(window.location.pathname)

      if (isAuthenticated && isAuthRoute(next)) {
        window.history.replaceState({}, '', '/dashboard')
        setRoute('/dashboard')
        return
      }

      if (!isAuthenticated && isAdminRoute(next)) {
        window.history.replaceState({}, '', '/login')
        setRoute('/login')
        return
      }

      setRoute(next)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isAuthenticated])

  const handleUpdateBookingStatus = async (
    bookingId: number,
    nextStatus: BookingStatus
  ) => {
    const currentBooking = bookingSnapshots.find((booking) => booking.id === bookingId)

    if (!currentBooking || currentBooking.status === nextStatus) {
      return
    }

    try {
      await bookingService.updateBookingStatus(bookingId, nextStatus)
      await loadBookings()
    } catch (error) {
      setBookingsError(getErrorMessage(error, 'Unable to update the booking status.'))
    }
  }

  const handleCreateRoom = async (payload: RoomPayload) => {
    await createRoom(payload)
  }

  const handleUpdateRoom = async (roomId: number, payload: RoomPayload) => {
    await updateRoom(roomId, payload)
  }

  const handleDeleteRoom = async (roomId: number) => {
    await deleteRoom(roomId)
  }

  const handleBulkDeleteRooms = async (roomIds: number[]) => {
    await bulkDeleteRooms(roomIds)
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    try {
      await login(email, password)
      setAuthError(null)
      event.currentTarget.reset()
    } catch (error) {
      setAuthError(getErrorMessage(error, 'Unable to log in.'))
    }
  }

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      await register({
        fullName: String(formData.get('fullName') ?? ''),
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
        confirmPassword: String(formData.get('confirmPassword') ?? ''),
      })
      setAuthError(null)
      event.currentTarget.reset()
    } catch (error) {
      setAuthError(getErrorMessage(error, 'Unable to register admin.'))
    }
  }

  const handleSwitchToRegister = () => {
    setAuthError(null)
    navigate('/register')
  }

  const handleSwitchToLogin = () => {
    setAuthError(null)
    navigate('/login')
  }

  const handleLogout = async () => {
    await logout()
    setAuthError(null)
    navigate('/login')
  }

  if (isInitializing) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="auth-card">
            <p className="auth-eyebrow">Hotel Management System</p>
            <h1>Checking session</h1>
            <p className="auth-subtitle">
              Restoring your admin session from the backend...
            </p>
          </div>
        </section>
      </main>
    )
  }

  if (!isAuthenticated) {
    if (effectiveRoute === '/register') {
      return (
        <RegisterPage
          onSubmit={handleRegisterSubmit}
          onGoToLogin={handleSwitchToLogin}
          errorMessage={authError}
          isLoading={isAuthLoading}
        />
      )
    }

    return (
      <LoginPage
        onSubmit={handleLoginSubmit}
        onGoToRegister={handleSwitchToRegister}
        errorMessage={authError}
        isLoading={isAuthLoading}
      />
    )
  }

  const adminRoute = isAdminRoute(effectiveRoute) ? effectiveRoute : '/dashboard'

  const pageContent =
    adminRoute === '/dashboard' ? (
      <DashboardOverviewPage
        rooms={rooms}
        bookings={bookings}
        guests={guests}
        serviceCharges={[]}
      />
    ) : adminRoute === '/rooms' ? (
      <RoomManagementPage
        rooms={rooms}
        isLoading={isRoomsLoading}
        mutationType={roomMutationType}
        error={roomError}
        onCreateRoom={handleCreateRoom}
        onUpdateRoom={handleUpdateRoom}
        onDeleteRoom={handleDeleteRoom}
        onBulkDeleteRooms={handleBulkDeleteRooms}
      />
    ) : adminRoute === '/bookings' ? (
      <BookingManagementPage
        bookings={bookings}
        guests={guests}
        error={bookingsError}
        isLoading={isBookingsLoading}
        onUpdateBookingStatus={handleUpdateBookingStatus}
      />
    ) : null

  return (
    <AdminLayout
      currentRoute={adminRoute}
      pageTitle={getAdminRouteTitle(adminRoute)}
      onNavigate={(nextRoute) => navigate(nextRoute)}
      onLogout={handleLogout}
    >
      {pageContent}
    </AdminLayout>
  )
}

export default App
