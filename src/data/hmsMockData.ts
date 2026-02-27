export type RoomStatus = 'available' | 'occupied' | 'maintenance'
export type RoomType = 'Single' | 'Double' | 'Suite' | 'Deluxe'

export type RoomRecord = {
  id: number
  roomNumber: string
  roomType: RoomType
  capacity: number
  pricePerNight: number
  status: RoomStatus
  description: string
  amenities: string[]
  images: string[]
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'canceled'

export type BookingRecord = {
  id: number
  guestId: number
  roomNumber: string
  roomType: RoomRecord['roomType']
  checkInDate: string
  checkOutDate: string
  status: BookingStatus
  baseAmount: number
}

export type GuestRecord = {
  id: number
  fullName: string
  email: string
  phone: string
  nationality: string
  address: string
  notes: string
}

export type ServiceCatalogRecord = {
  id: number
  name: string
  unitPrice: number
}

export type ServiceChargeRecord = {
  id: number
  bookingId: number
  serviceId: number
  quantity: number
  amount: number
  chargedAt: string
}

export const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateFromOffset = (offsetDays: number) => {
  const nextDate = new Date()
  nextDate.setHours(0, 0, 0, 0)
  nextDate.setDate(nextDate.getDate() + offsetDays)
  return toLocalIsoDate(nextDate)
}

export const roomsMock: RoomRecord[] = [
  {
    id: 1001200345,
    roomNumber: '101',
    roomType: 'Single',
    capacity: 1,
    pricePerNight: 3900,
    status: 'available',
    description: 'Compact single room with desk and fast WiFi.',
    amenities: ['WiFi', 'Smart TV', 'Air Conditioning'],
    images: ['/rooms/standard-room.png', '/rooms/standard-room.png'],
  },
  {
    id: 1001200346,
    roomNumber: '102',
    roomType: 'Single',
    capacity: 1,
    pricePerNight: 4100,
    status: 'occupied',
    description: 'Quiet single room ideal for solo business travel.',
    amenities: ['WiFi', 'Air Conditioning', 'Work Desk'],
    images: ['/rooms/standard-room.png', '/rooms/deluxe-suite.png'],
  },
  {
    id: 1001200347,
    roomNumber: '103',
    roomType: 'Single',
    capacity: 1,
    pricePerNight: 3800,
    status: 'maintenance',
    description: 'Single room currently under preventive maintenance.',
    amenities: ['WiFi', 'Smart TV'],
    images: ['/rooms/standard-room.png'],
  },
  {
    id: 1001200348,
    roomNumber: '201',
    roomType: 'Double',
    capacity: 2,
    pricePerNight: 5600,
    status: 'available',
    description: 'Comfortable double room with city skyline view.',
    amenities: ['WiFi', 'Smart TV', 'Mini Fridge', 'Air Conditioning'],
    images: ['/rooms/standard-room.png', '/rooms/family-suite.png'],
  },
  {
    id: 1001200349,
    roomNumber: '202',
    roomType: 'Double',
    capacity: 2,
    pricePerNight: 5800,
    status: 'occupied',
    description: 'Double room with modern interior and premium bedding.',
    amenities: ['WiFi', 'Smart TV', 'Mini Bar', 'Air Conditioning'],
    images: ['/rooms/standard-room.png', '/rooms/deluxe-suite.png'],
  },
  {
    id: 1001200350,
    roomNumber: '203',
    roomType: 'Double',
    capacity: 2,
    pricePerNight: 6000,
    status: 'available',
    description: 'Double room with extra space and sofa corner.',
    amenities: ['WiFi', 'Smart TV', 'Mini Fridge', 'Sofa'],
    images: ['/rooms/standard-room.png', '/rooms/family-suite.png'],
  },
  {
    id: 1001200351,
    roomNumber: '301',
    roomType: 'Suite',
    capacity: 3,
    pricePerNight: 9200,
    status: 'occupied',
    description: 'Suite with separate lounge area and rain shower.',
    amenities: ['WiFi', 'Smart TV', 'Mini Bar', 'Bathtub', 'Lounge Area'],
    images: ['/rooms/deluxe-suite.png', '/rooms/family-suite.png'],
  },
  {
    id: 1001200352,
    roomNumber: '302',
    roomType: 'Suite',
    capacity: 3,
    pricePerNight: 9500,
    status: 'available',
    description: 'Suite room with corner windows and extra seating.',
    amenities: ['WiFi', 'Smart TV', 'Mini Bar', 'Coffee Maker'],
    images: ['/rooms/deluxe-suite.png', '/rooms/standard-room.png'],
  },
  {
    id: 1001200353,
    roomNumber: '303',
    roomType: 'Suite',
    capacity: 3,
    pricePerNight: 9100,
    status: 'maintenance',
    description: 'Suite undergoing room enhancement upgrades.',
    amenities: ['WiFi', 'Smart TV', 'Bathtub'],
    images: ['/rooms/deluxe-suite.png'],
  },
  {
    id: 1001200354,
    roomNumber: '401',
    roomType: 'Deluxe',
    capacity: 4,
    pricePerNight: 12800,
    status: 'available',
    description: 'Deluxe room with balcony and panoramic skyline.',
    amenities: ['WiFi', 'Smart TV', 'Mini Bar', 'Balcony', 'Bathtub'],
    images: ['/rooms/family-suite.png', '/rooms/deluxe-suite.png'],
  },
  {
    id: 1001200355,
    roomNumber: '402',
    roomType: 'Deluxe',
    capacity: 4,
    pricePerNight: 13200,
    status: 'occupied',
    description: 'Premium deluxe room with larger living zone.',
    amenities: ['WiFi', 'Smart TV', 'Mini Bar', 'Dining Corner'],
    images: ['/rooms/family-suite.png', '/rooms/standard-room.png'],
  },
  {
    id: 1001200356,
    roomNumber: '403',
    roomType: 'Deluxe',
    capacity: 4,
    pricePerNight: 12900,
    status: 'available',
    description: 'Deluxe room designed for group and family stays.',
    amenities: ['WiFi', 'Smart TV', 'Mini Bar', 'Sofa Bed'],
    images: ['/rooms/family-suite.png', '/rooms/deluxe-suite.png'],
  },
]

export const guestsMock: GuestRecord[] = [
  {
    id: 1,
    fullName: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    phone: '+63 917 123 4567',
    nationality: 'Filipino',
    address: 'Makati City, Metro Manila',
    notes: 'Prefers quiet floor',
  },
  {
    id: 2,
    fullName: 'John Carlo Reyes',
    email: 'jc.reyes@yahoo.com',
    phone: '+63 920 222 3344',
    nationality: 'Filipino',
    address: 'Quezon City, Metro Manila',
    notes: 'Business traveler',
  },
  {
    id: 3,
    fullName: 'Alyssa Dela Cruz',
    email: 'alyssa.dc@outlook.com',
    phone: '+63 918 555 1001',
    nationality: 'Filipino',
    address: 'Cebu City, Cebu',
    notes: 'Allergic to peanuts',
  },
  {
    id: 4,
    fullName: 'Paolo Mendoza',
    email: 'paolo.mendoza@gmail.com',
    phone: '+63 917 600 7788',
    nationality: 'Filipino',
    address: 'Davao City, Davao del Sur',
    notes: 'Family stay',
  },
  {
    id: 5,
    fullName: 'Patricia Lim',
    email: 'patricia.lim@proton.me',
    phone: '+63 919 333 8190',
    nationality: 'Filipino',
    address: 'Taguig City, Metro Manila',
    notes: 'Requested airport pickup',
  },
  {
    id: 6,
    fullName: 'Ramon Garcia',
    email: 'ramon.garcia@yahoo.com',
    phone: '+63 906 888 1122',
    nationality: 'Filipino',
    address: 'Iloilo City, Iloilo',
    notes: 'Prefers early check-in',
  },
  {
    id: 7,
    fullName: 'Angela Panganiban',
    email: 'angela.panganiban@gmail.com',
    phone: '+63 917 400 5510',
    nationality: 'Filipino',
    address: 'Baguio City, Benguet',
    notes: 'Vegan meal preference',
  },
  {
    id: 8,
    fullName: 'Dennis Navarro',
    email: 'dennis.navarro@outlook.com',
    phone: '+63 998 221 4550',
    nationality: 'Filipino',
    address: 'Pasig City, Metro Manila',
    notes: 'Extra towels needed',
  },
  {
    id: 9,
    fullName: 'Sofia Valdez',
    email: 'sofia.valdez@gmail.com',
    phone: '+63 917 729 1188',
    nationality: 'Filipino',
    address: 'Manila City, Metro Manila',
    notes: 'Late checkout request',
  },
  {
    id: 10,
    fullName: 'Mark Flores',
    email: 'mark.flores@proton.me',
    phone: '+63 915 666 2090',
    nationality: 'Filipino',
    address: 'Muntinlupa City, Metro Manila',
    notes: 'No special requests',
  },
]

export const bookingsMock: BookingRecord[] = [
  {
    id: 1001,
    guestId: 1,
    roomNumber: '202',
    roomType: 'Double',
    checkInDate: dateFromOffset(0),
    checkOutDate: dateFromOffset(2),
    status: 'confirmed',
    baseAmount: 8400,
  },
  {
    id: 1002,
    guestId: 2,
    roomNumber: '301',
    roomType: 'Suite',
    checkInDate: dateFromOffset(-1),
    checkOutDate: dateFromOffset(1),
    status: 'checked-in',
    baseAmount: 12500,
  },
  {
    id: 1003,
    guestId: 3,
    roomNumber: '302',
    roomType: 'Suite',
    checkInDate: dateFromOffset(-2),
    checkOutDate: dateFromOffset(0),
    status: 'checked-out',
    baseAmount: 11800,
  },
  {
    id: 1004,
    guestId: 4,
    roomNumber: '401',
    roomType: 'Deluxe',
    checkInDate: dateFromOffset(1),
    checkOutDate: dateFromOffset(4),
    status: 'pending',
    baseAmount: 23600,
  },
  {
    id: 1005,
    guestId: 5,
    roomNumber: '203',
    roomType: 'Double',
    checkInDate: dateFromOffset(3),
    checkOutDate: dateFromOffset(5),
    status: 'canceled',
    baseAmount: 7600,
  },
  {
    id: 1006,
    guestId: 6,
    roomNumber: '403',
    roomType: 'Deluxe',
    checkInDate: dateFromOffset(0),
    checkOutDate: dateFromOffset(3),
    status: 'confirmed',
    baseAmount: 18900,
  },
  {
    id: 1007,
    guestId: 7,
    roomNumber: '401',
    roomType: 'Deluxe',
    checkInDate: dateFromOffset(2),
    checkOutDate: dateFromOffset(5),
    status: 'pending',
    baseAmount: 14400,
  },
  {
    id: 1008,
    guestId: 8,
    roomNumber: '102',
    roomType: 'Single',
    checkInDate: dateFromOffset(-1),
    checkOutDate: dateFromOffset(1),
    status: 'checked-in',
    baseAmount: 8100,
  },
  {
    id: 1009,
    guestId: 9,
    roomNumber: '402',
    roomType: 'Deluxe',
    checkInDate: dateFromOffset(-3),
    checkOutDate: dateFromOffset(1),
    status: 'confirmed',
    baseAmount: 21900,
  },
  {
    id: 1010,
    guestId: 10,
    roomNumber: '201',
    roomType: 'Double',
    checkInDate: dateFromOffset(-5),
    checkOutDate: dateFromOffset(-1),
    status: 'checked-out',
    baseAmount: 9200,
  },
]

export const serviceCatalogMock: ServiceCatalogRecord[] = [
  { id: 1, name: 'Room Service', unitPrice: 650 },
  { id: 2, name: 'Laundry', unitPrice: 350 },
  { id: 3, name: 'Spa Access', unitPrice: 1500 },
  { id: 4, name: 'Airport Transfer', unitPrice: 1200 },
  { id: 5, name: 'Mini Bar Refill', unitPrice: 500 },
]

export const serviceChargesMock: ServiceChargeRecord[] = [
  {
    id: 1,
    bookingId: 1002,
    serviceId: 1,
    quantity: 2,
    amount: 1300,
    chargedAt: dateFromOffset(0),
  },
  {
    id: 2,
    bookingId: 1002,
    serviceId: 2,
    quantity: 1,
    amount: 350,
    chargedAt: dateFromOffset(0),
  },
  {
    id: 3,
    bookingId: 1008,
    serviceId: 5,
    quantity: 3,
    amount: 1500,
    chargedAt: dateFromOffset(-1),
  },
  {
    id: 4,
    bookingId: 1003,
    serviceId: 3,
    quantity: 1,
    amount: 1500,
    chargedAt: dateFromOffset(-2),
  },
]
