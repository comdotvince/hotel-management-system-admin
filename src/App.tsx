import { type FormEvent, useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import {
  generateRoomInventoryId,
  roomInventory as initialRoomInventory,
  type RoomInventoryId,
  type RoomInventoryItem,
} from './data/rooms'
import './App.css'

type Route =
  | '/'
  | '/dashboard'
  | '/dashboard/bookings'
  | '/dashboard/rooms'
  | `/dashboard/rooms/${number}`

const ROOM_ROUTE_PREFIX = '/dashboard/rooms/'
const MAX_ROOM_ID = 9_999_999_999

type RoomMutationInput = Omit<RoomInventoryItem, 'id'>
type LegacyRoomInventoryItem = RoomInventoryItem & {
  image?: string
  images?: string[]
}

const parseRoomInventoryId = (value: string): RoomInventoryId | undefined => {
  const parsedId = Number(value)

  if (
    !Number.isInteger(parsedId) ||
    parsedId < 1 ||
    parsedId > MAX_ROOM_ID
  ) {
    return undefined
  }

  return parsedId
}

const getRoomIdFromRoute = (route: Route): RoomInventoryId | undefined => {
  if (!route.startsWith(ROOM_ROUTE_PREFIX)) {
    return undefined
  }

  return parseRoomInventoryId(route.slice(ROOM_ROUTE_PREFIX.length))
}

const buildRoomDetailRoute = (roomId: RoomInventoryId): Route =>
  `/dashboard/rooms/${roomId}`

const normalizeRoomImages = (
  room: Partial<Pick<LegacyRoomInventoryItem, 'images' | 'image'>>
) => {
  if (Array.isArray(room.images) && room.images.length) {
    return Array.from(
      new Set(
        room.images
          .map((image) => image.trim())
          .filter((image) => image.length > 0)
      )
    )
  }

  if (typeof room.image === 'string') {
    const legacyImage = room.image.trim()
    if (legacyImage) {
      return [legacyImage]
    }
  }

  return []
}

const normalizeRoomInventoryItem = (
  room: RoomInventoryItem | LegacyRoomInventoryItem
): RoomInventoryItem => ({
  ...room,
  images: normalizeRoomImages(room),
})

const getRouteFromPath = (): Route => {
  const { pathname } = window.location

  if (pathname === '/dashboard') {
    return '/dashboard'
  }

  if (pathname === '/dashboard/rooms') {
    return '/dashboard/rooms'
  }

  if (pathname === '/dashboard/bookings') {
    return '/dashboard/bookings'
  }

  if (pathname.startsWith(ROOM_ROUTE_PREFIX)) {
    const roomId = parseRoomInventoryId(pathname.slice(ROOM_ROUTE_PREFIX.length))
    if (roomId) {
      return buildRoomDetailRoute(roomId)
    }
  }

  return '/'
}

function App() {
  const [route, setRoute] = useState<Route>(getRouteFromPath)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [roomInventory, setRoomInventory] = useState<RoomInventoryItem[]>(
    () => initialRoomInventory.map(normalizeRoomInventoryItem)
  )

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

  const handleCreateRoom = (roomInput: RoomMutationInput) => {
    setRoomInventory((currentInventory) => [
      ...currentInventory,
      {
        id: generateRoomInventoryId(),
        ...roomInput,
        images: normalizeRoomImages(roomInput),
      },
    ])
  }

  const handleUpdateRoom = (
    roomIdToUpdate: RoomInventoryId,
    roomInput: RoomMutationInput
  ) => {
    setRoomInventory((currentInventory) =>
      currentInventory.map((room) =>
        room.id === roomIdToUpdate
          ? {
              ...room,
              ...roomInput,
              images: normalizeRoomImages(roomInput),
            }
          : room
      )
    )
  }

  const handleDeleteRoom = (roomIdToDelete: RoomInventoryId) => {
    setRoomInventory((currentInventory) =>
      currentInventory.filter((room) => room.id !== roomIdToDelete)
    )

    if (roomIdToDelete === roomId) {
      navigate('/dashboard/rooms')
    }
  }

  if (
    route === '/dashboard' ||
    route === '/dashboard/bookings' ||
    route === '/dashboard/rooms' ||
    roomId
  ) {
    return (
      <Dashboard
        roomInventory={roomInventory}
        view={
          route === '/dashboard'
            ? 'overview'
            : route === '/dashboard/bookings'
              ? 'bookings'
            : route === '/dashboard/rooms'
              ? 'rooms'
              : 'room-details'
        }
        roomId={roomId}
        onLogout={() => navigate('/')}
        onNavigateOverview={() => navigate('/dashboard')}
        onNavigateBookings={() => navigate('/dashboard/bookings')}
        onNavigateRooms={() => navigate('/dashboard/rooms')}
        onOpenRoomDetails={(selectedRoomId) =>
          navigate(buildRoomDetailRoute(selectedRoomId))
        }
        onCreateRoom={handleCreateRoom}
        onUpdateRoom={handleUpdateRoom}
        onDeleteRoom={handleDeleteRoom}
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
