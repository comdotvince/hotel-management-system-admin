export type RoomTypeId = 'standard-room' | 'deluxe-suite' | 'family-suite'

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

export const rooms: RoomType[] = [
  {
    id: 'standard-room',
    code: 'A1',
    type: 'Standard Room',
    floorRange: 'Floors 1-3',
    roomsPerFloor: 6,
    floorCount: 3,
    totalRooms: 18,
    availableRooms: 1,
    image: '/rooms/standard-room.png',
    description:
      'Balanced option for short and business stays with efficient layout.',
    amenities: ['Queen bed', 'Work desk', 'Smart TV', 'City view'],
    floorAvailability: [
      { floor: 1, available: 0 },
      { floor: 2, available: 1 },
      { floor: 3, available: 0 },
    ],
  },
  {
    id: 'deluxe-suite',
    code: 'B1',
    type: 'Deluxe Suite',
    floorRange: 'Floors 4-6',
    roomsPerFloor: 4,
    floorCount: 3,
    totalRooms: 12,
    availableRooms: 1,
    image: '/rooms/deluxe-suite.png',
    description:
      'Upgraded suite with larger lounge area for premium guest experience.',
    amenities: ['King bed', 'Lounge corner', 'Coffee bar', 'Panoramic window'],
    floorAvailability: [
      { floor: 4, available: 0 },
      { floor: 5, available: 1 },
      { floor: 6, available: 0 },
    ],
  },
  {
    id: 'family-suite',
    code: 'C1',
    type: 'Family Suite',
    floorRange: 'Floors 7-9',
    roomsPerFloor: 2,
    floorCount: 3,
    totalRooms: 6,
    availableRooms: 1,
    image: '/rooms/family-suite.png',
    description:
      'Spacious multi-guest configuration designed for family travel groups.',
    amenities: ['2 bedrooms', 'Mini pantry', 'Large seating area', 'Bathtub'],
    floorAvailability: [
      { floor: 7, available: 1 },
      { floor: 8, available: 0 },
      { floor: 9, available: 0 },
    ],
  },
]

export const isRoomTypeId = (value: string): value is RoomTypeId =>
  rooms.some((room) => room.id === value)

export const getRoomById = (roomId: RoomTypeId) =>
  rooms.find((room) => room.id === roomId)
