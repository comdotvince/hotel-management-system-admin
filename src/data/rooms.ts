export type RoomTypeId = 'standard-room' | 'deluxe-suite' | 'family-suite'

export type RoomAvailabilityStatus = 'available' | 'occupied'

export type RoomType = {
  id: RoomTypeId
  code: string
  type: string
  floorRange: string
  roomsPerFloor: number
  floorCount: number
  totalRooms: number
  availableRooms: number
  image: string
  description: string
  amenities: string[]
  floorAvailability: Array<{
    floor: number
    available: number
  }>
}

export type RoomInventoryItem = {
  id: number
  roomNumber: string
  floor: number
  typeId: RoomTypeId
  status: RoomAvailabilityStatus
  images: string[]
}

export type RoomInventoryId = RoomInventoryItem['id']

type RoomTypeDefinition = {
  id: RoomTypeId
  code: string
  type: string
  floors: number[]
  roomsPerFloor: number
  image: string
  description: string
  amenities: string[]
  availableRoomNumbers: string[]
}

const roomTypeDefinitions: RoomTypeDefinition[] = [
  {
    id: 'standard-room',
    code: 'A1',
    type: 'Standard Room',
    floors: [1, 2, 3],
    roomsPerFloor: 6,
    availableRoomNumbers: ['205'],
    image: '/rooms/standard-room.png',
    description:
      'Balanced option for short and business stays with efficient layout.',
    amenities: ['Queen bed', 'Work desk', 'Smart TV', 'City view'],
  },
  {
    id: 'deluxe-suite',
    code: 'B1',
    type: 'Deluxe Suite',
    floors: [4, 5, 6],
    roomsPerFloor: 4,
    availableRoomNumbers: ['503'],
    image: '/rooms/deluxe-suite.png',
    description:
      'Upgraded suite with larger lounge area for premium guest experience.',
    amenities: ['King bed', 'Lounge corner', 'Coffee bar', 'Panoramic window'],
  },
  {
    id: 'family-suite',
    code: 'C1',
    type: 'Family Suite',
    floors: [7, 8, 9],
    roomsPerFloor: 2,
    availableRoomNumbers: ['701'],
    image: '/rooms/family-suite.png',
    description:
      'Spacious multi-guest configuration designed for family travel groups.',
    amenities: ['2 bedrooms', 'Mini pantry', 'Large seating area', 'Bathtub'],
  },
]

const formatFloorRange = (floors: number[]) => {
  if (floors.length === 1) {
    return `Floor ${floors[0]}`
  }

  return `Floors ${floors[0]}-${floors[floors.length - 1]}`
}

const buildRoomNumber = (floor: number, index: number) =>
  `${floor}${String(index + 1).padStart(2, '0')}`

const MAX_ROOM_ID = 9_999_999_999
const usedRoomIds = new Set<number>()

export const generateRoomInventoryId = () => {
  let nextId = 0

  do {
    nextId = Math.floor(Math.random() * MAX_ROOM_ID) + 1
  } while (usedRoomIds.has(nextId))

  usedRoomIds.add(nextId)
  return nextId
}

const createInventoryForType = (
  roomTypeDefinition: RoomTypeDefinition
): RoomInventoryItem[] => {
  const availableRooms = new Set(roomTypeDefinition.availableRoomNumbers)

  return roomTypeDefinition.floors.flatMap((floor) =>
    Array.from({ length: roomTypeDefinition.roomsPerFloor }, (_, index) => {
      const roomNumber = buildRoomNumber(floor, index)

      return {
        id: generateRoomInventoryId(),
        roomNumber,
        floor,
        typeId: roomTypeDefinition.id,
        status: availableRooms.has(roomNumber) ? 'available' : 'occupied',
        images: [],
      }
    })
  )
}

export const roomInventory: RoomInventoryItem[] =
  roomTypeDefinitions.flatMap(createInventoryForType)

const buildRoomTypeSummary = (
  roomTypeDefinition: RoomTypeDefinition
): RoomType => {
  const roomsByType = roomInventory.filter(
    (room) => room.typeId === roomTypeDefinition.id
  )

  const availableRooms = roomsByType.filter(
    (room) => room.status === 'available'
  ).length

  const floorAvailability = roomTypeDefinition.floors.map((floor) => ({
    floor,
    available: roomsByType.filter(
      (room) => room.floor === floor && room.status === 'available'
    ).length,
  }))

  return {
    id: roomTypeDefinition.id,
    code: roomTypeDefinition.code,
    type: roomTypeDefinition.type,
    floorRange: formatFloorRange(roomTypeDefinition.floors),
    roomsPerFloor: roomTypeDefinition.roomsPerFloor,
    floorCount: roomTypeDefinition.floors.length,
    totalRooms: roomsByType.length,
    availableRooms,
    image: roomTypeDefinition.image,
    description: roomTypeDefinition.description,
    amenities: roomTypeDefinition.amenities,
    floorAvailability,
  }
}

export const rooms: RoomType[] = roomTypeDefinitions.map(buildRoomTypeSummary)

export const isRoomTypeId = (value: string): value is RoomTypeId =>
  rooms.some((room) => room.id === value)

export const getRoomById = (roomId: RoomTypeId) =>
  rooms.find((room) => room.id === roomId)

export const isRoomInventoryId = (value: number): value is RoomInventoryId =>
  roomInventory.some((room) => room.id === value)

export const getRoomInventoryById = (roomId: RoomInventoryId) =>
  roomInventory.find((room) => room.id === roomId)
