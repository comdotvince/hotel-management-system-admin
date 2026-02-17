import { type FormEvent, useEffect, useState } from 'react'
import DashboardPage from './components/DashboardPage'
import LoginPage from './components/LoginPage'
import { isRoomTypeId, type RoomTypeId } from './data/rooms'
import './App.css'

type Route =
  | '/'
  | '/dashboard'
  | '/dashboard/rooms'
  | `/dashboard/rooms/${RoomTypeId}`

const ROOM_ROUTE_PREFIX = '/dashboard/rooms/'

const getRoomIdFromRoute = (route: Route): RoomTypeId | undefined => {
  if (!route.startsWith(ROOM_ROUTE_PREFIX)) {
    return undefined
  }

  const roomId = route.slice(ROOM_ROUTE_PREFIX.length)
  return isRoomTypeId(roomId) ? roomId : undefined
}

const buildRoomDetailRoute = (roomId: RoomTypeId): Route =>
  `/dashboard/rooms/${roomId}`

const getRouteFromPath = (): Route => {
  const { pathname } = window.location

  if (pathname === '/dashboard') {
    return '/dashboard'
  }

  if (pathname === '/dashboard/rooms') {
    return '/dashboard/rooms'
  }

  if (pathname.startsWith(ROOM_ROUTE_PREFIX)) {
    const roomId = pathname.slice(ROOM_ROUTE_PREFIX.length)
    if (isRoomTypeId(roomId)) {
      return buildRoomDetailRoute(roomId)
    }
  }

  return '/'
}

function App() {
  const [route, setRoute] = useState<Route>(getRouteFromPath)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    const handlePopState = () => setRoute(getRouteFromPath())

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const navigate = (nextRoute: Route) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, '', nextRoute)
    }

    setRoute(nextRoute)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/dashboard')
  }

  const handleToggleMode = () => {
    setMode((currentMode) => (currentMode === 'login' ? 'signup' : 'login'))
  }

  const roomId = getRoomIdFromRoute(route)

  if (route === '/dashboard' || route === '/dashboard/rooms' || roomId) {
    return (
      <DashboardPage
        view={
          route === '/dashboard'
            ? 'overview'
            : route === '/dashboard/rooms'
              ? 'rooms'
              : 'room-details'
        }
        roomId={roomId}
        onLogout={() => navigate('/')}
        onNavigateOverview={() => navigate('/dashboard')}
        onNavigateRooms={() => navigate('/dashboard/rooms')}
        onOpenRoomDetails={(selectedRoomId) =>
          navigate(buildRoomDetailRoute(selectedRoomId))
        }
        onBackToRooms={() => navigate('/dashboard/rooms')}
      />
    )
  }

  return (
    <LoginPage
      mode={mode}
      onSubmit={handleSubmit}
      onToggleMode={handleToggleMode}
    />
  )
}

export default App
