import { roomsMock, type RoomRecord } from '../data/hmsMockData'

export type RoomPayload = Omit<RoomRecord, 'id'>

const ROOM_ID_LIMIT = 9_999_999_999

const cloneRoom = (room: RoomRecord): RoomRecord => ({
  ...room,
  amenities: [...room.amenities],
  images: [...room.images],
})

let roomStore: RoomRecord[] = roomsMock.map(cloneRoom)

const simulateRequest = async <T>(operation: () => T, delayMs = 450): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    window.setTimeout(() => {
      try {
        resolve(operation())
      } catch (error) {
        reject(error)
      }
    }, delayMs)
  })

const generateRoomId = () => {
  let nextId = Math.floor(Math.random() * ROOM_ID_LIMIT) + 1
  while (roomStore.some((room) => room.id === nextId)) {
    nextId = Math.floor(Math.random() * ROOM_ID_LIMIT) + 1
  }
  return nextId
}

const validateRoomPayload = (payload: RoomPayload, roomId?: number) => {
  if (!payload.roomNumber.trim()) {
    throw new Error('Room number is required.')
  }

  if (payload.capacity < 1) {
    throw new Error('Capacity must be at least 1.')
  }

  if (payload.pricePerNight <= 0) {
    throw new Error('Price per night must be greater than 0.')
  }

  if (!payload.description.trim()) {
    throw new Error('Description is required.')
  }

  const duplicateRoom = roomStore.find(
    (room) =>
      room.roomNumber.trim().toLowerCase() === payload.roomNumber.trim().toLowerCase() &&
      room.id !== roomId
  )

  if (duplicateRoom) {
    throw new Error('Room number already exists.')
  }
}

export const roomService = {
  getRooms: async () =>
    simulateRequest(() => roomStore.map(cloneRoom)),

  createRoom: async (payload: RoomPayload) =>
    simulateRequest(() => {
      validateRoomPayload(payload)
      const newRoom: RoomRecord = {
        ...payload,
        id: generateRoomId(),
        roomNumber: payload.roomNumber.trim(),
        description: payload.description.trim(),
      }

      roomStore = [newRoom, ...roomStore]
      return cloneRoom(newRoom)
    }),

  updateRoom: async (roomId: number, payload: RoomPayload) =>
    simulateRequest(() => {
      validateRoomPayload(payload, roomId)
      const targetRoomIndex = roomStore.findIndex((room) => room.id === roomId)

      if (targetRoomIndex < 0) {
        throw new Error('Room not found.')
      }

      const updatedRoom: RoomRecord = {
        ...payload,
        id: roomId,
        roomNumber: payload.roomNumber.trim(),
        description: payload.description.trim(),
      }

      const nextRooms = [...roomStore]
      nextRooms[targetRoomIndex] = updatedRoom
      roomStore = nextRooms
      return cloneRoom(updatedRoom)
    }),

  deleteRoom: async (roomId: number) =>
    simulateRequest(() => {
      const roomExists = roomStore.some((room) => room.id === roomId)
      if (!roomExists) {
        throw new Error('Room not found.')
      }

      roomStore = roomStore.filter((room) => room.id !== roomId)
    }),

  bulkDeleteRooms: async (roomIds: number[]) =>
    simulateRequest(() => {
      const idSet = new Set(roomIds)
      roomStore = roomStore.filter((room) => !idSet.has(room.id))
    }),
}
