import type { RoomRecord, RoomStatus, RoomType } from '../data/hmsMockData'
import { api } from './api'

export type RoomPayload = Omit<RoomRecord, 'id'>

type BackendRoom = {
  room_id?: number | string | null
  roomid?: number | string | null
  room_title?: string | null
  room_number?: string | null
  room_category?: string | null
  room_type?: string | null
  room_description?: string | null
  room_availability?: string | null
  room_status?: string | null
  room_url?: string | null
  room_image?: string | null
  capacity?: number | string | null
  room_capacity?: number | string | null
  price_per_night?: number | string | null
  room_price?: number | string | null
  amenities?: string[] | string | null
  room_amenities?: string[] | string | null
}

type BackendRoomPayload = {
  room_title: string
  room_category: string
  room_description: string
  room_availability: string
  room_url: string
  room_price: number
  room_capacity: number
}

type CreateRoomResponse = {
  message: string
  room_id: number
  room?: BackendRoomPayload
}

const VALID_ROOM_TYPES: RoomType[] = ['Single', 'Double', 'Suite', 'Deluxe']

const coerceNumber = (value: unknown, fallback = 0) => {
  const parsedValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN

  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

const coerceString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

const parseStringList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value !== 'string') {
    return []
  }

  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return []
  }

  if (trimmedValue.startsWith('[')) {
    try {
      return parseStringList(JSON.parse(trimmedValue))
    } catch {
      return [trimmedValue]
    }
  }

  if (trimmedValue.includes(',')) {
    return trimmedValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return [trimmedValue]
}

const toRoomType = (value: unknown): RoomType => {
  const normalizedValue = coerceString(value).toLowerCase()

  return (
    VALID_ROOM_TYPES.find(
      (roomType) => roomType.toLowerCase() === normalizedValue
    ) ?? 'Single'
  )
}

const toRoomStatus = (value: unknown): RoomStatus => {
  const normalizedValue = coerceString(value).toLowerCase()

  if (normalizedValue === 'available') {
    return 'available'
  }

  if (
    normalizedValue === 'not available' ||
    normalizedValue === 'occupied'
  ) {
    return 'occupied'
  }

  return 'maintenance'
}

const toBackendAvailability = (status: RoomStatus) => {
  if (status === 'available') {
    return 'Available'
  }

  if (status === 'occupied') {
    return 'Not Available'
  }

  return 'Maintenance'
}

const toRoomRecord = (room: BackendRoom): RoomRecord => {
  const roomId = coerceNumber(room.room_id ?? room.roomid)
  const images = parseStringList(room.room_url ?? room.room_image)

  return {
    id: roomId,
    roomNumber:
      coerceString(room.room_title ?? room.room_number) ||
      (roomId ? String(roomId) : 'Unassigned'),
    roomType: toRoomType(room.room_category ?? room.room_type),
    capacity: Math.max(1, coerceNumber(room.capacity ?? room.room_capacity, 1)),
    pricePerNight: Math.max(
      0,
      coerceNumber(room.price_per_night ?? room.room_price, 0)
    ),
    status: toRoomStatus(room.room_availability ?? room.room_status),
    description: coerceString(room.room_description),
    amenities: parseStringList(room.amenities ?? room.room_amenities),
    images,
  }
}

const toBackendPayload = (payload: RoomPayload): BackendRoomPayload => ({
  room_title: payload.roomNumber.trim(),
  room_category: payload.roomType,
  room_description: payload.description.trim(),
  room_availability: toBackendAvailability(payload.status),
  room_url: payload.images[0] ?? '',
  room_price: payload.pricePerNight,
  room_capacity: payload.capacity,
})

const fetchRooms = async () => {
  const rooms = await api.get<BackendRoom[]>('/api/room/get')
  return rooms.map(toRoomRecord)
}

const findRoomById = async (roomId: number) => {
  const rooms = await fetchRooms()
  return rooms.find((room) => room.id === roomId) ?? null
}

export const roomService = {
  getRooms: async (): Promise<RoomRecord[]> => fetchRooms(),

  createRoom: async (payload: RoomPayload): Promise<RoomRecord> => {
    const body = toBackendPayload(payload)
    const response = await api.post<CreateRoomResponse>('/api/room/create', body)

    return (
      (await findRoomById(response.room_id)) ??
      toRoomRecord({
        room_id: response.room_id,
        ...(response.room ?? body),
      })
    )
  },

  updateRoom: async (roomId: number, payload: RoomPayload): Promise<RoomRecord> => {
    const body = toBackendPayload(payload)

    await api.put<{ message: string }>(`/api/room/edit/${roomId}`, body)

    return (
      (await findRoomById(roomId)) ??
      toRoomRecord({
        room_id: roomId,
        ...body,
      })
    )
  },

  deleteRoom: async (roomId: number): Promise<void> => {
    await api.delete<{ message: string }>('/api/room/delete', { roomid: roomId })
  },

  bulkDeleteRooms: async (roomIds: number[]): Promise<void> => {
    await Promise.all(
      roomIds.map((roomId) =>
        api.delete<{ message: string }>('/api/room/delete', {
          roomid: roomId,
        })
      )
    )
  },
}
